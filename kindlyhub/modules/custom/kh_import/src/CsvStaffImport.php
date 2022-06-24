<?php
/**
 * @file
 * Contains \Drupal\kh_import\CsvStaffImport.
 */
namespace Drupal\kh_import;

use Drupal\kh_import\EntityFields;
use Drupal\user\Entity\User;
use Drupal\node\Entity\Node;

class CsvStaffImport {
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
   * @var array
   */
  private $userFields;
  /**
   * @var mixed
   */
  private $csvFileName;

  /**
   * @var mixed
   */
  private $agency;

  /**
   * CsvStaffImport constructor.
   * @param $params
   */
  function __construct($params){
    $this->csv_fid = $params['csv_fid'];
    $this->csvData = isset($params['csv_data']) ? $params['csv_data'] : [];
    $this->header_row = isset($params['header']) ? $params['header'] : [];
    $this->userFields = $this->getFields();
    $this->csvFileName = $params['csvFileName'];
    $this->agency = Node::load($params['agency']);
  }

  /**
   * @return array
   */
  public function getFields() {
    $fields = [];
    $definitions = \Drupal::service('entity_field.manager')->getFieldDefinitions('user', 'user');
    foreach ($definitions as $field_name => $field_definition) {
      if (!empty($field_definition->getTargetBundle())) {
        $name = $field_definition->getName();
        $fields[$name] = [
          'type' => $field_definition->getType(),
          'setting' => $field_definition->getSettings()
        ];
      }
    }
    return $fields;
  }

  /**
   *
   */
  public function process(){
    $operations = $this->operations();
    $batch = array(
      'progress_message' => t('Staff importing from CSV....'),
      'title' => t('Importing Staff from CSV'),
      'operations' => $operations,
      'finished' => [$this, 'addStaffFinishedCallback'],
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
        $operations[] = [[$this, 'addUserFromCSV'], [$content]];
      }
    }
    return $operations;
  }

  /**
   * @param $success
   * @param $results
   * @param $operations
   */
  public function addStaffFinishedCallback($success, $results, $operations) {
    // The 'success' parameter means no fatal PHP errors were detected. All
    // other error management should be handled using 'results'.
    if ($success) {
      $message = t('@added users added, @updated users updated', ['@added' => $results['added'], '@updated' => $results['updated']]);
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
  public function addUserFromCSV($content, array &$context){
    $total_rows = count($this->csvData);
    $row_number = $content['key'];
    $message = t('<em>@row_number</em> rows processes out of <em>@total_rows</em> from <em>@csvFileName</em>', ['@row_number' => $row_number, '@total_rows' => $total_rows, '@csvFileName' => $this->csvFileName]);
    $results = array();
    $result = $this->CsvInsertUpdateUser($this->header_row, $content);

    if (empty($context['message'])){
      $context['message'] = array();
    }
    $context['message'] = $message;

    if (empty($context['results'])){
      $context['results'] = array();
    }
    if (empty($context['results']['updated'])){
      $context['results']['updated'] = 0;
    }
    if (empty($context['results']['added'])){
      $context['results']['added'] = 0;
    }

    if(isset($result['added']) && $result['added'] == 1){
      $context['results']['added']++;
    }else{
      $updated = $context['results']['updated']++;
    }
    $context['results']['updated_user'] = $added;
    $context['results']['added_user'] = $updated;

  }

  /**
   * @param $csv_fields
   * @param $content
   * @return array
   * @throws \Drupal\Core\Entity\EntityStorageException
   */

  public function CsvInsertUpdateUser($csv_fields, $content){
    //Existing user
    $email = isset($content['mail']) ? $content['mail'] : 0;
    $username = isset($content['username']) ? $content['username'] : 0;
    $query = \Drupal::service('entity.query')->get('user');
    $or = $query->orConditionGroup();
    $or->condition('mail', $email);
    $or->condition('name', $username);
    $query->condition($or);
    $entity_ids = $query->execute();

   if ($entity_ids) {
    $uid = current($entity_ids);
    $user_object = User::load($uid);
    $result['updated'] = 1;
   }
   else {
    $user_object = User::create();
    $result['added'] = 1;
   }
    $user_object->set('field_agency_reference', ['target_id' => $this->agency->id()]);
    $user_object->set('field_user_regional_reference', ['target_id' => $this->agency->field_regional_reference->target_id]);
    $user_data = [];
    //print_r($content);
    foreach ($csv_fields as $field) {
      $field = trim($field);
      if (isset($this->userFields[$field])){
        $field_settings = $this->userFields[$field]['setting'];
//print_r($this->userFields);
        switch( $this->userFields[$field]['type'] ) {
          case 'entity_reference':
            if($field_settings['target_type'] == 'taxonomy_term') {
              $termsData =  $content[$field];
              if( $termsData){
                $terms= EntityFields::getTermReference($field_settings['handler_settings']['target_bundles'], $termsData);
                //$user_data[$field] = $terms;
                $user_object->set($field, $terms);
              }
            }
            else if($field_settings['target_type'] == 'user') {
             break;
            }
            else if($field_settings['target_type'] == 'node') {
              if ($field == 'field_classroom_reference' || $field == 'field_user_location_reference' ) {
                break;
              }
              else {
                $nodeTitles = explode(',', $content[$field]);
                $nodeTitles = array_map('trim', $nodeTitles);
                $target_bundles = $field_settings['handler_settings']['target_bundles'];
                $nodes = EntityFields::getNodeInfo($nodeTitles, $target_bundles);
                $user_data[$field] = $nodes;
                $user_object->set($field, $nodes);
              }
            }
            break;
          case 'text_with_summary':
          case 'text_long':
          case 'text':
             $user_object->set($field, $content[$field]);
             $user_data[$field] = $content[$field];
            break;
          case 'datetime':
          case 'date':
          if (!empty($content[$field])){
              $dateTime = strtotime($content[$field]);
              $newDateString = date('Y-m-d', $dateTime);
              $user_object->set($field, $newDateString);
            }
            break;
          case 'timestamp':
            $user_object->set($field, strtotime($content[$field]));
            break;
          case 'string':
            $user_object->set($field, $content[$field]);
            $user_data[$field] = $content[$field];
            break;
          case 'boolean':
            $value = (!empty($content[$field]) && ($content[$field] == 'On' || $content[$field] == 'Yes')) ? 1 : 0 ;
            $user_object->set($field, $value);
            break;
          case 'langcode':
            $user_object->set($field, $content[$field]);
          default:
            $user_object->set($field, $content[$field]);
            break;
        }
      }
    }

    //Update class and location
    $class_location = EntityFields::getClassLocationReff($content, $this->agency);
    if (isset($class_location['location_nid'])){
      $locations = $user_object->get('field_user_location_reference')->getValue();
      if (!empty($class_location['location_nid'])) {
        $update_locations = [];
        if ($locations) {
          foreach ($locations as $location) {
            if ($location['target_id'] != $class_location['location_nid']) {
              $update_locations[] = $location;
            }
          }
        }
        $update_locations[] = ['target_id' => $class_location['location_nid']];
        //echo '<pre>';
        //print_r($update_locations);
        //die();
        $user_object->set('field_user_location_reference', $update_locations);
      }
    }
    if (isset($class_location['class_nid'])){
      $classes = $user_object->get('field_classroom_reference')->getValue();

      if (!empty($class_location['class_nid'])) {
        $update_classes = [];
        if ($classes) {
          foreach ($classes as $class) {
            if ($class['target_id'] != $class_location['class_nid']) {
              $update_classes[] = $class;
            }
          }
        }
        $update_classes[] = ['target_id' => $class_location['class_nid']];
        $user_object->set('field_classroom_reference', $update_classes);
      }
    }
    //Set email and username
    $is_valid_email = FALSE;
    if (isset($content['username'])){
      $user_object->setUsername($content['username']);
      $user_object->setPassword('password');
    }

    if (empty($content['field_adult_first_name'])) {
      //print_r($content);
      $content_keys = array_keys($content);
      $content_values = array_values($content);
      //print_r($content_keys);


     // print_r($content_values);
      if (isset($content_keys['0'])) {
         $user_object->set('field_adult_first_name', $content_values['0']);
      }
    }

    //find out duplicate email
    if (!empty($content['mail'])){
      $user_object->setEmail($content['mail']);
      $user_object->set('init', $content['mail']);
    }
    $role = $this->roles_mapping($content['role']);
    if ($role) {
      $user_object->addRole($role);
    }
    $user_object->activate();
    $user_object->save();
    $result['user'] = $user_object;
    return $result;
  }

  public function roles_mapping($role) {
    $role_maps = [
      'Staff' => 'teacher',
      'Manager' => 'agency_manager',
      'Location Manager'  => 'school_manager',
      'Admin' => 'agency_administrator',
      'Staff with approval' => 'staff_with_approval'
    ];
    $role = trim($role);
    if (isset($role_maps[$role])) {
      return $role_maps[$role];
    }
    else {
      $roles = user_role_names();
      $roles_flip = array_flip($roles);
      if (isset($roles_flip[$role])) {
        return $roles_flip[$role];
      }
      else {
        return null;
      }
    }
  }

}
