<?php

/**
 * @file
 * Contains \Drupal\custom_module\Form\DataImportForm
 */

namespace Drupal\custom_module\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\user\RoleInterface;
use Drupal\custom_module\Controller\DataImortController;
use Twilio\Rest\Client;

class DataImportForm extends FormBase {

  /**
   * Implements \Drupal\Core\Form\FormInterface::getFormID().
   */
  public function getFormID() {
    return 'data_import_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [];
  }

  /**
   * Implements \Drupal\Core\Form\FormInterface::buildForm().
   *
   * @param array $form
   *   The form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   *
   * @return array $form
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['#tree'] = TRUE;
    
    $form['file'] = [
      '#type' => 'file',
      '#title' => 'CSV file upload',
      '#upload_validators' => [
        'file_validate_extensions' => ['csv']
      ]
    ];
    $form['actions']['#type'] = 'actions';
    $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => $this->t('Import users'),
      '#button_type' => 'primary',
    );

    // By default, render the form using theme_system_config_form().
    $form['#theme'] = 'system_config_form';
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // Validate options.
    $roles = $form_state->getValue(['config', 'roles']);
    $roles_selected = array_filter($roles, function($item) {
      return ($item);
    });
    // if (empty($roles_selected)) {
    //   $form_state->setErrorByName('roles', $this->t('Please select at least one role to apply to the imported user(s).'));
    // }
    // Validate file.
    $this->file = file_save_upload('file', $form['file']['#upload_validators']);
    if (!$this->file[0]) {
      $form_state->setErrorByName('file');
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
     $file = $this->file[0];
   //  $roles = $form_state->getValue(['config', 'roles']);
   // // print_r($roles); die;
   //  $config = [
   //    'roles'=>$roles,
   //  ];
  
  
   //  if ($created = DataImortController::ProcessUpload($file, $config)) {
   //    drupal_set_message(t('Successfully imported @count users.', ['@count' => ($created)]));
   //  }
   //  else {
   //    drupal_set_message(t('No users imported.'));
   //  }
   //      $form_state->setRedirectUrl(new Url('custom_module.dataimport'));



    $handle = fopen($file->destination, 'r');
  
    //$total = count($data);



    if(empty($handle) === false) {
      $checkMail = [];
      $batch = [
      'title' => t('Importing user'),
      'operations' => [],
      'init_message' => t('Import process is starting.'),
      'progress_message' => t('Processed @current out of @total. Estimated time: @estimate.'),
      'error_message' => t('The process has encountered an error.'),
      //'finished' => '\Drupal\custom_module\Controller\ClassroomController::deleteNodeExampleFinishedCallback',
      ];
      $checkPhone = [];
      $newData = [];
      $j = 1;
      $famArr = [];
    while(($data = fgetcsv($handle)) !== FALSE){

        if($j > 1){
          //$abcd = \Drupal\custom_module\Controller\DataImortController::ProcessUpload($data, $context);
          $batch['operations'][] = [['\Drupal\custom_module\Controller\DataImortController', 'ProcessUpload'], [$data]];


       //   if(!in_array($data[0], $checkPhone)){
          
       //    $famArr = array('uuid'=> $data[0], 'mail'=> $data[9], 'action' => 'add', 'phone' => $data[10], 'lname' => $data[8]);
          
       //  }else{
       //    $famArr = array('uuid'=> $data[0], 'mail'=> $data[9], 'action' => 'update', 'phone' => $data[10], 'lname' => $data[8]);
       //  }

       // // $batch['operations'][] = [['\Drupal\custom_module\Form\DataImportForm', 'updateFamily'], [$famArr]];
       //  $abcd = \Drupal\custom_module\Form\DataImportForm::updateFamily($famArr, $context);
       //  $checkPhone[] = $data[0];

        // if(!empty($data[14]) && !in_array($data[14], $checkPhone)){
        //   $batch['operations'][] = [['\Drupal\custom_module\Form\DataImportForm', 'updateFamily'], [$data[14]]];
        //   $checkPhone[] = $data[14];
        // }
      
        
           //$batch['operations'][] = [['\Drupal\custom_module\Form\DataImportForm', 'sendMailTouser1'], [$data]];
          // $checkPhone[] = $data[10];

          // if(!in_array($data[5], $checkMail)) {
          //     $data['action'] = 'add';
          //   $batch['operations'][] = [['\Drupal\custom_module\Controller\DataImortController', 'ProcessUpload'], [$data]];
          // }else{
          //   $data['action'] = 'update';
          //   $batch['operations'][] = [['\Drupal\custom_module\Controller\DataImortController', 'ProcessUpload'], [$data]];
          // }

          //$batch['operations'][] = [['\Drupal\custom_module\Form\DataImportForm', 'checkAbc'], [$data]];
          $checkMail[][$data[9]] = $data[9];
          
        }
      $j++;
        //}
      //}
    }
      batch_set($batch);
      //dsm($checkPhone);
      \Drupal::messenger()->addMessage('Imported '.count($checkMail).' users!');
      $form_state->setRebuild(TRUE);
    }
}

  /**
   * @param $entity
   * Deletes an entity
   */


  public function updateFamily($dataVal, &$context){


    $userExist = self::user_checkEmail($dataVal['mail']);
    $userExistPhone = self::user_checkPhone($dataVal['phone']);
    $userExist = !empty($userExist) ? $userExist : $userExistPhone;
    $field_joined_user = [];
  

      $query = db_select('node__field_uuid', 'n');
      $query->fields('n',array('entity_id'));
      $query->condition('n.field_uuid_value', $dataVal['uuid'], '=');
      $results = $query->execute()->fetchField();

      $query1 = db_select('node_field_data', 'n');
      $query1->leftjoin('node__field_family_last_name', 'ln', 'n.nid = ln.entity_id');
      $query1->fields('n',array('nid'));
      $query1->condition('n.uid',$userExist, '=');
      $query1->condition('n.type','family_group','=');
      $query1->condition('ln.field_family_last_name_value', $dataVal['lname'], '=');
      $results1 = $query1->execute()->fetchField();
echo $results."---".$results1; 
      $nodeUpdate = Node::load($results);
      print_r($joined = $nodeUpdate->get('field_family_reference')->getValue()); die;

      if($dataVal['action'] == 'add'){

        $joined = array(array('target_id' => $results1));
      
      }else{
        $joined = $nodeUpdate->get('field_family_reference')->getValue();
        $joined[] = array(
        'target_id' => $results1
        );
      }
      
      //print_r($field_joined_user); die;
      
      $nodeUpdate->field_family_reference = $joined;
      $nodeUpdate->save();
die;


    $item = $dada[7];     
    $context['results'][] = $item;
    $context['message'] = t('Created @title', array('@title' => $item));
  }
  public function importUsers($dataVal, &$context) {
    $data = $dataVal;
    $UserId = db_select('users_field_data', 'm')
      ->fields('m',array('uid'))
      ->condition('mail',$data[7],'=')
      ->execute()
      ->fetchField();
    if($UserId > 0){
      //echo $data[4];

      $locId = db_select('node_field_data', 'n')
      ->fields('n',array('nid'))
      ->condition('title', $data[4], '=')
      ->condition('type','location','=')
      ->execute()
      ->fetchField();

      $user = \Drupal\user\Entity\User::load($UserId);
      //$regionrefrence = $user->get('field_user_location_reference')->getValue();
        //$refrnceid = $regionrefrence[0]['target_id'];
        
        $regionrefrence = array('target_id' => $locId);

        //print_r($regionrefrence); die;
        //print_r($data[4]);
      $query = db_select('node_field_data', 'n');
      $query->leftjoin('node__field_location_reference', 'lc', 'n.nid = lc.entity_id');
      $query->fields('n',array('nid'));
      $query->condition('n.title',$data[6], '=');
      $query->condition('n.type', 'classroom','=');
      $query->condition('lc.field_location_reference_target_id', $locId, '=');
      $results = $query->execute()->fetchField();
      
      if(!empty($results)){
        $classRef = $user->get('field_classroom_reference')->getValue();
        $classRef[] = array('target_id' => $results);
        $user->set('field_classroom_reference', $classRef);
        // dsm($classRef);
        // dsm($UserId);
      }

     
      
      $user->set('field_user_location_reference', $regionrefrence);
      
      $user->save();
      //  print_r($regionrefrence);
      //print_r($classRef);
      // echo $UserId;
      // die;
      $item = $dada[7];     
    $context['results'][] = $item;
    $context['message'] = t('Created @title', array('@title' => $item));
    }

  }


public function sendMailTouser1($dataVal, &$context){
    $data = $dataVal;
    $item = $data;
    $UserId = db_select('users_field_data', 'm')
      ->fields('m',array('uid'))
      ->condition('mail',$data[5],'=')
      ->execute()
      ->fetchField();

      $users = user_load($UserId);
      $op = 'register_no_approval_required';
      $mail = _user_mail_notify($op, $users, $langcode = 'en');
    $item = $data[5];
    $context['results'][] = $item;
    $context['message'] = t('Created @title', array('@title' => $item));

  }


  public function sendMessageTouser($dataVal){
    $data = $dataVal;
//     $users = user_load(986);
//     $op = 'register_no_approval_required';
// $mail = _user_mail_notify($op, $users, $langcode = 'en');
// die;

        $UserId = db_select('user__field_mobile_number“', 'm')
          ->fields('m',array('entity_id'))
          ->condition('field_mobile_number_value', trim($data), '=')
          ->execute()
          ->fetchField();
          //return $UserId;
          $phone = str_replace("(", "", $data);
          $phone = str_replace(")", "", $phone);
          $phone = str_replace("-", " ", $phone);
          

          $account = user_load($UserId);

                $resetUrl =  user_pass_reset_url($account, $options = array('langcode' => 'en')); 
                $name = $account->get('name')->getValue();
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
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
                curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
                $result = curl_exec($ch);
                $resultToJson = json_decode($result);
                if (isset($resultToJson->link)) {
                    $shortLink =  $resultToJson->link;
                }

                //$mobile = '+919875177770';
                $mobile = '+1'.$phone;
                $messages = "Sunrise created you a Kindly account! \nClick ".$shortLink." to set your password. Log in at kindlyhub.com with username: ".$name[0]['value']."";
                $sid    = "ACf0272a70bab8c01234842e1f228eb258";
                $token  = "af852c9f229aa05f1d374fe490e20fe7";
                $twilio = new Client($sid, $token);
                $message = $twilio->messages
                                  ->create($mobile, // to
                                           ["from" => "+1 205 463 5990", "body" => $messages]
                                  );
                $sent = $message->sid;
                if ($sent != '') {
                    dsm('One time login send to -- '.$mobile);
                  }else{
                    return;
                  }
                  return $sent;

  }


 public function user_checkPhone($phone){

    $UserId = db_select('user__field_mobile_number“', 'm')
      ->fields('m',array('entity_id'))
      ->condition('field_mobile_number_value',$phone,'=')
      ->execute()
      ->fetchField();
      return $UserId;

  }

  public function user_checkEmail($mail){

    $UserId = db_select('users_field_data', 'm')
      ->fields('m',array('uid'))
      ->condition('mail',$mail,'=')
      ->execute()
      ->fetchField();
      return $UserId;

  }

}