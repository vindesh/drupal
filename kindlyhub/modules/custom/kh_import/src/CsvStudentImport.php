<?php
/**
 * @file
 * Contains \Drupal\kh_import\CsvStudentImport.
 */
namespace Drupal\kh_import;

use Drupal\kh_import\EntityFields;
use Drupal\user\Entity\User;
use Drupal\node\Entity\Node;

class CsvStudentImport {
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
  private $contentFields;
  /**
   * @var mixed
   */
  private $csvFileName;

  /**
   * @var mixed
   */
  private $agency;

  /**
   * CsvStudentImport constructor.
   * @param $params
   */
  function __construct($params){
    $this->csv_fid = $params['csv_fid'];
    $this->csvData = isset($params['csv_data']) ? $params['csv_data'] : [];
    $this->header_row = isset($params['header']) ? $params['header'] : [];
    $this->contentFields = $this->getFields();
    $this->csvFileName = $params['csvFileName'];
    $this->agency = Node::load($params['agency']);
  }

  /**
   * @return array
   */
  public function getFields() {
    $fields = [];
    $definitions = \Drupal::service('entity_field.manager')->getFieldDefinitions('node', 'student');
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
      'progress_message' => t('Student importing from CSV....'),
      'title' => t('Importing Student from CSV'),
      'operations' => $operations,
      'finished' => [$this, 'addStudentFinishedCallback'],
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
        $operations[] = [[$this, 'addStudentFromCSV'], [$content]];
      }
    }
    return $operations;
  }

  /**
   * @param $success
   * @param $results
   * @param $operations
   */
  public function addStudentFinishedCallback($success, $results, $operations) {
    // The 'success' parameter means no fatal PHP errors were detected. All
    // other error management should be handled using 'results'.
    if ($success) {
      $message = t('@added student added, @updated student updated', ['@added' => $results['added'], '@updated' => $results['updated']]);
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
  public function addStudentFromCSV($content, array &$context){
    $total_rows = count($this->csvData);
    $row_number = $content['key'];
    $message = t('<em>@row_number</em> rows processes out of <em>@total_rows</em> from <em>@csvFileName</em>', ['@row_number' => $row_number, '@total_rows' => $total_rows, '@csvFileName' => $this->csvFileName]);
    $results = array();
    $result = $this->CsvInsertUpdateNode($this->header_row, $content);

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

  public function CsvInsertUpdateNode($csv_fields, $content){
    //Check existing student
    //print_r($content);

    $field_uuid = isset($content['field_uuid']) ? trim($content['field_uuid']) : '';
    $student_first_name = isset($content['field_student_first_name']) ? trim($content['field_student_first_name']) : '';
    $student_last_name = isset($content['field_student_last_name']) ? trim($content['field_student_last_name']) : '';
    $date_of_birth = isset($content['field_date_of_birth']) ? date('Y-m-d', strtotime(trim($content['field_date_of_birth']))) : '';
   // die();
    $query = \Drupal::service('entity.query')->get('node');
    $query->condition('type', 'student');
    $query->condition('field_agency', $this->agency->id());
    $query->condition('field_uuid', $field_uuid);
    if (empty($field_uuid)) {
      $query->condition('field_student_first_name', $student_first_name);
      $query->condition('field_student_last_name', $student_last_name);
    }
    $entity_ids = $query->execute();

    if ($entity_ids) {
      $nid = current($entity_ids);
      $node_object = Node::load($nid);
      $result['updated'] = 1;
    }
    else {
      $node_object = Node::create([
        'type' => 'student',
        'title' => $student_last_name. ', ' . $student_first_name
      ]);
      $result['added'] = 1;
    }
    $node_data = [];
    $node_object->set('field_agency', ['target_id' => $this->agency->id()]);
    $node_data['field_agency'] = ['target_id' => $this->agency->id()];
    $node_object->set('field_regional_reference', ['target_id' => $this->agency->field_regional_reference->target_id]);
    $node_data['field_regional_reference'] = ['target_id' => $this->agency->field_regional_reference->target_id];
    //print_r($content);
    foreach ($csv_fields as $field) {
      $field = trim($field);
      if (isset($this->contentFields[$field])) {
        $field_settings = $this->contentFields[$field]['setting'];
        switch( $this->contentFields[$field]['type'] ) {
          case 'entity_reference':
            if($field_settings['target_type'] == 'taxonomy_term') {
              $termsData =  trim($content[$field]);
              if( $termsData){
                $terms= EntityFields::getTermReference($field_settings['handler_settings']['target_bundles'], $termsData);
                $node_object->set($field, $terms);
              }
            }
            else {
              break;
            }
            break;
          case 'text_with_summary':
          case 'text_long':
          case 'text':
            $node_object->set($field, $content[$field]);
            $node_data[$field] = $content[$field];
            break;
          case 'datetime':
          case 'date':
          if (!empty($content[$field])){
              $dateTime = strtotime(trim($content[$field]));
              $newDateString = date('Y-m-d', $dateTime);
              $node_object->set($field, $newDateString);
              $node_data[$field] = $newDateString;
            }
            break;
          case 'timestamp':
            $node_object->set($field, strtotime(trim($content[$field])));
            break;
          case 'boolean':
            $value = (!empty($content[$field]) && (trim($content[$field]) == 'On' || trim($content[$field]) == 'Yes')) ? 1 : 0 ;
            $node_object->set($field, $value);
            break;
          case 'langcode':
            $node_object->set($field, $content[$field]);
          default:
            $node_object->set($field, trim($content[$field]));
            $node_data[$field] = $content[$field];
            break;
        }
      }
    }

    //Update class and location
    $class_location = EntityFields::getClassLocationReff($content, $this->agency);
    if (isset($class_location['location_nid'])){
      if (!empty($class_location['location_nid'])) {
        $update_locations = ['target_id' => $class_location['location_nid']];
        $node_object->set('field_location_reference', $update_locations);
        $node_data['field_location_reference'] = $update_locations;
      }
    }
    if (isset($class_location['class_nid'])){
      if (!empty($class_location['class_nid'])) {
        $update_classes = ['target_id' => $class_location['class_nid']];
        $node_object->set('field_classroom_reference', $update_classes);
        $node_data['field_classroom_reference'] = $update_classes;
      }
    }
    //Update class and location
    $funding_source = EntityFields::getFundingSourceRef($content, $this->agency);
    if ($funding_source) {
      $node_object->set('field_funded_by', ['target_id' => $funding_source]);
      $node_data['field_funded_by'] = ['target_id' => $funding_source];
    }

    //Update Family member
    $family_group_nid = EntityFields::getFamilyRef($content, $this->agency);
    if ($family_group_nid) {
      $node_object->set('field_family_reference', ['target_id' => $family_group_nid]);
      $node_data['field_family_reference'] = ['target_id' => $family_group_nid];
    }
    //print_r($node_data);
    //die();
    //$node_object->setPublished(TRUE);
    $node_object->save();
    $result['node'] = $node_object;
    return $result;
  }

}
