<?php
/**
 * @file
 * Contains \Drupal\kh_import\CsvSendNotification.
 */
namespace Drupal\kh_import;

use Drupal\Core\Url;
use Drupal\user\Entity\User;
use Twilio\Rest\Client;

class CsvSendNotification {
  /**
   * @var array|mixed
   */
  private $csvData = [];
  /**
   * @var array|mixed
   */
  private $header_row;
  /**
   * @var integer
   */
  private $csv_fid;
   /**
   * @var mixed
   */
  private $csvFileName;

  /**
   * @var mixed
   */
  private $agency;

  /**
   * CsvSendNotification constructor.
   * @param $params
   */
  function __construct($params){
    $this->csv_fid = $params['csv_fid'];
    $this->csvData = isset($params['csv_data']) ? $params['csv_data'] : [];
    $this->header_row = isset($params['header']) ? $params['header'] : [];
    $this->csvFileName = $params['csvFileName'];
    //$this->agency = Node::load($params['agency']);
  }


  /**
   *
   */
  public function process(){
    $operations = $this->operations();
    $batch = array(
      'progress_message' => t('Notifying from CSV....'),
      'title' => t('Notifying from CSV'),
      'operations' => $operations,
      'finished' => [$this, 'notificationFinishedCallback'],
    );
    batch_set($batch);
  }

  /**
   * @return array
   */
  public function operations() {
    $operations = [];
    if (!empty($this->csvData)){
      $fields_row = $this->csvData['0'];
      $fields_row = array_map('trim', $fields_row);
      unset($this->csvData['0']);
      $total_rows = count($this->csvData);
      foreach($this->csvData as $key => $row){
        $content = array_combine($fields_row, $row);
        $content['key'] = $key;
        $operations[] = [[$this, 'notifyFromCSV'], [$content]];
      }
    }
    return $operations;
  }

  /**
   * @param $success
   * @param $results
   * @param $operations
   */
  public function notificationFinishedCallback($success, $results, $operations) {
    // The 'success' parameter means no fatal PHP errors were detected. All
    // other error management should be handled using 'results'.
    if ($success) {
      $message_str = '';
      $msg_params = [];
      if ($results['email_notify'] > 0) {
        $message_str .= '@email_notify users notified via their Email<br>';
        $msg_params['@email_notify'] = $results['email_notify'];
      }
      if ($results['pa_email_notify'] > 0) {
        $message_str .= '@pa_email_notify Primary Adult users notified via their Email<br>';
        $msg_params['@pa_email_notify'] = $results['pa_email_notify'];
      }
      if ($results['sa_email_notify'] > 0) {
        $message_str .= '@sa_email_notify Secondary Adult users notified via their Email<br>';
        $msg_params['@sa_email_notify'] = $results['sa_email_notify'];
      }
      if ($results['email_not_exist'] > 0) {
        $message_str .= '@email_not_exist email does not exists<br>';
        $msg_params['@email_not_exist'] = $results['email_not_exist'];
      }
      if ($results['pa_phone_notify'] > 0) {
        $message_str .= '@pa_phone_notify Primary Adult users notified on their phone via SMS<br>';
        $msg_params['@pa_phone_notify'] = $results['pa_phone_notify'];
      }
      if ($results['sa_phone_notify'] > 0) {
        $message_str .= '@sa_phone_notify Secondary Adult users notified on their phone via SMS <br>';
        $msg_params['@sa_phone_notify'] = $results['sa_phone_notify'];
      }
      if ($results['ph_not_exist'] > 0) {
       $message_str .= '@ph_not_exist phone number does not exists in the uploaded CSV<br>';
       $msg_params['@ph_not_exist'] = $results['ph_not_exist'];
      }
      $message = t($message_str, $msg_params);
      if (!empty( $this->csv_fid)){
        file_delete( $this->csv_fid);
      }
    }
    else {
      $message = t('Finished with an error.');
    }
    drupal_set_message($message);
  }

  /**
   * @param $content
   * @param array $context
   */
  public function notifyFromCSV($content, array &$context){
    $total_rows = count($this->csvData);
    $row_number = $content['key'];
    $message = t('<em>@row_number</em> rows processes out of <em>@total_rows</em> from <em>@csvFileName</em>', ['@row_number' => $row_number, '@total_rows' => $total_rows, '@csvFileName' => $this->csvFileName]);
    $result = $this->notifyUser($content);

    if (empty($context['message'])){
      $context['message'] = array();
    }
    $context['message'] = $message;

    if (!isset($context['results']['email_notify'])){
      $context['results']['email_notify'] = 0;
    }
    if(isset($result['email_notify']) && $result['email_notify'] == 1) {
      $context['results']['email_notify']++;
    }

    if (!isset($context['results']['pa_email_notify'])){
      $context['results']['pa_email_notify'] = 0;
    }
    if(isset($result['pa_email_notify']) && $result['pa_email_notify'] == 1) {
      $context['results']['pa_email_notify']++;
    }

    if (!isset($context['results']['pa_phone_notify'])) {
      $context['results']['pa_phone_notify'] = 0;
    }
    if(isset($result['sa_email_notify']) && $result['sa_email_notify'] == 1) {
      $context['results']['sa_email_notify']++;
    }

    if (!isset($context['results']['pa_phone_notify'])) {
      $context['results']['pa_phone_notify'] = 0;
    }
    if(isset($result['pa_phone_notify']) && $result['pa_phone_notify'] == 1) {
      $context['results']['pa_phone_notify']++;
    }

    if (!isset($context['results']['sa_phone_notify'])) {
      $context['results']['sa_phone_notify'] = 0;
    }
    if(isset($result['sa_phone_notify']) && $result['sa_phone_notify'] == 1) {
      $context['results']['sa_phone_notify']++;
    }

    if (!isset($context['results']['ph_not_exist'])) {
      $context['results']['ph_not_exist'] = 0;
    }
    if(isset($result['ph_not_exist']) && $result['ph_not_exist'] == 1) {
      $context['results']['ph_not_exist']++;
    }
  }

  /**
   * @param $content
   * @return array
   * @throws \Drupal\Core\Entity\EntityStorageException
   */

  public function notifyUser($content){
    //Existing user
    $total_email_send = $total_sms_send = 0;
    $result = ['email_notify' => 0, 'pa_email_notify' => 0, 'sa_email_notify' => 0, 'email_not_exist' => 0,
      'pa_phone_notify' => 0, 'pa_phone_notify' => 0, 'ph_not_exist' => 0];
    $email = isset($content['mail']) ? $content['mail'] : '';
    if (!empty($email)) {
      $query = \Drupal::service('entity.query')->get('user');
      $query->condition('mail', $email);
      $entity_ids = $query->execute();
      if ($entity_ids) {
        $uid = current($entity_ids);
        $user = User::load($uid);
        $result['email_notify'] = 1;
        $password = '';
        $this->sendEmailNotification($user, $password);
        $total_email_send++;
      }
    }
    $pa_email = isset($content['pa_email']) ? $content['pa_email'] : '';
    if (!empty($pa_email)) {
      $query = \Drupal::service('entity.query')->get('user');
      $query->condition('mail', $pa_email);
      $entity_ids = $query->execute();
      if ($entity_ids) {
        $uid = current($entity_ids);
        $user = User::load($uid);
        $result['pa_email_notify'] = 1;
        $password = '';
        $this->sendEmailNotification($user, $password);
        $total_email_send++;
      }
    }
    $sa_email = isset($content['sa_email']) ? $content['sa_email'] : '';
    if (!empty($pa_email)) {
      $query = \Drupal::service('entity.query')->get('user');
      $query->condition('mail', $sa_email);
      $entity_ids = $query->execute();
      if ($entity_ids) {
        $uid = current($entity_ids);
        $user = User::load($uid);
        $result['sa_email_notify'] = 1;
        $password = '';
        $this->sendEmailNotification($user, $password);
        $total_email_send++;
      }
    }

   if ($total_email_send == 0) {
      $result['email_not_exist'] = 1;
    }

    //SMS notification pa_phone
    $pa_phone = isset($content['pa_phone']) ? $content['pa_phone'] : '';
    if (!empty($pa_phone)) {
      $query = \Drupal::service('entity.query')->get('user');
      $query->condition('field_mobile_number', $pa_phone);
      $entity_ids = $query->execute();
      if ($entity_ids) {
        $uid = current($entity_ids);
        $user = User::load($uid);
        $this->sendSMSNotification($user);
        $result['pa_phone_notify'] = 1;
        $total_sms_send++;
      }
    }

    $sa_phone = isset($content['sa_phone']) ? $content['sa_phone'] : '';
    if (!empty($sa_phone)) {
      $query = \Drupal::service('entity.query')->get('user');
      $query->condition('field_mobile_number', $sa_phone);
      $entity_ids = $query->execute();
      if ($entity_ids) {
        $uid = current($entity_ids);
        $user = User::load($uid);
        $this->sendSMSNotification($user);
        $result['sa_phone_notify'] = 1;
        $total_sms_send++;
      }
    }

    if ($total_sms_send == 0) {
      $result['ph_not_exist'] = 1;
    }
    return $result;
  }

  public function sendEmailNotification($user, $password){

    $mailManager = \Drupal::service('plugin.manager.mail');
    $module = 'kh_import';
    $key = 'email_notification';
    $to = $user->getEmail();
    $first_name = $user->get('field_adult_first_name')->value;
    /*
    if (empty($first_name)) {
      $first_name = $user->getUsername();
    }
    $site_name = \Drupal::config('system.site')->get('name');
    $login_url = \Drupal::config('system.site')->get('login_url');
    $resetUrl =  user_pass_reset_url($user, $options = array('langcode' => 'en'));
    //$message = t('Thank you for showing your support for GIST and the innovators from around the world competing in the @competition! Here is the code you need to enter on the voting page to complete the voting process: your one time email verification code is @code', ['@competition' => $competition, '@code' => $code]);
    $params['subject'] = t('Account details for @first_name at @site_name', ['@first_name' => $first_name, '@site_name' => $site_name]);
    $params['message'] = t('
      Hi @first_name,<br><br>

      Thank you @first_name for registering at @site_name. You may now log in by clicking this link or copying and pasting it into your browser:<br><br>

      @resetUrl<br><br>

      This link can only be used once to log in and will lead you to a page where you can set your password.<br><br>

      After setting your password, you will be able to log in at @login_url in the future using:<br><br>

      username: @email<br><br>
      password: Your password<br><br>

      --  @site_name team<br><br>
      ',
      [
        '@first_name' => $first_name,
        '@site_name' => $site_name,
        '@resetUrl' => $resetUrl,
        '@login_url' => Url::fromRoute('user.login', [], ['absolute' => TRUE])->toString(),
        '@email' => $to
      ]
    );
    $langcode = \Drupal::currentUser()->getPreferredLangcode();
    $send = true;
    $result = $mailManager->mail($module, $key, $to, $langcode, $params, NULL, $send);
    */
    $op = 'register_no_approval_required';
    $result = _user_mail_notify($op, $user, $langcode = 'en');

    return $result;
  }

  /**
   * @param $user
   * @return string
   * @throws \Twilio\Exceptions\ConfigurationException
   * @throws \Twilio\Exceptions\TwilioException
   */
  public function sendSMSNotification($user){

    $phone = $user->get('field_mobile_number')->value;
    $agency_title = $user->get('field_agency_reference')->entity->getTitle();

    $phone = str_replace("(", "", $phone);
    $phone = str_replace(")", "", $phone);
    $phone = str_replace("-", " ", $phone);


    $resetUrl =  user_pass_reset_url($user, $options = array('langcode' => 'en'));
    $username = $user->getUsername();
    $long_url = $resetUrl;
    $apiv4 = 'https://api-ssl.bitly.com/v4/bitlinks';
    $genericAccessToken = '6b13086f30a1651153f092238034a9b8a6ba9423';

    $data = array(
      'long_url' => $long_url
    );
    $payload = json_encode($data);
    $header = array(
      'Authorization: Bearer ' . $genericAccessToken,
      'Content-Type: application/json',
      'Content-Length: ' . strlen($payload)
    );
    $ch = curl_init($apiv4);
    if (file_exists('/etc/ssl/certs/STAR_kindlyhub_21_com.crt')) {
      curl_setopt($ch, CURLOPT_SSLCERT, "/etc/ssl/certs/STAR_kindlyhub_21_com.crt");
      curl_setopt($ch, CURLOPT_SSLKEY, "/etc/ssl/certs/kindlyhub.key");
      curl_setopt($ch, CURLOPT_CAINFO, "/etc/ssl/certs/cacert.pem");
    }

    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
    $result = curl_exec($ch);
    $resultToJson = json_decode($result);
    if (isset($resultToJson->link)) {
      $shortLink =  $resultToJson->link;
    }

    //$mobile = '+910000000' for testing;
    $mobile = '+1'.$phone;

    $messages = $agency_title." created you a Kindly account! \nClick ".$shortLink." to set your password. Log in at kindlyhub.com with username: " . $username ."";
    $sid    = "ACf0272a70bab8c01234842e1f228eb258";
    $token  = "af852c9f229aa05f1d374fe490e20fe7";
    $twilio = new Client($sid, $token);

    $message = $twilio->messages->create(
      $mobile, // to
      ["from" => "+1 205 463 5990", "body" => $messages]
    );
    $sent = $message->sid;
    // Logs a notice
    $log_message = t('SMS has been sent at @phone_no with twilio sid = @sid', ['@phone_no' => $mobile, '@sid' => $sent]);
    \Drupal::logger('kh_import')->notice($log_message);
    return $sent;
  }
}
