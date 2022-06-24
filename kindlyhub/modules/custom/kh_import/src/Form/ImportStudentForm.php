<?php
/**
 * @file
 * Contains \Drupal\kh_import\Form\ImportStudentForm.
 */
namespace Drupal\kh_import\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\Form;
use Drupal\kh_import\CsvParser;
use Drupal\kh_import\CsvStudentImport;
use Drupal\user\Entity\User;
use Drupal\node\Entity\Node;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Url;
/**
 * Members Import form.
 */

class ImportStudentForm extends FormBase {
  /**
   * @var string
   */
  private $file_name = '';
  /**
   * @var int
   */
  private $file_id = 0;

  public function getFormID() {
    return 'csv_student_import';
  }

  /**
   * @param array $form
   * @param FormStateInterface $form_state
   * @return array
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    //$agency = Node::load('493');
    //$source = $agency->get('field_fun')->getValue();
    //dpm($source);
    $form['file_upload'] = [
      '#type' => 'managed_file',
      '#title' => t('Upload Student CSV File'),
      '#size' => 40,
      '#description' => t('Upload the student\'s CSV file to be import. All student will be import as nodes type Student/Participants'),
      '#required' => TRUE,
      '#autoupload' => TRUE,
      '#upload_validators' => ['file_validate_extensions' => ['csv']]
    ];

    $current_user = \Drupal::currentUser();
    $roles = $current_user->getRoles();
    if (in_array('administrator', $roles)) {
      $form['agency'] = [
        '#type' => 'entity_autocomplete',
        '#title' => t('Agency'),
        '#target_type' => 'node',
        '#required' => TRUE,
        '#selection_handler' => 'default', // Optional. The default selection handler is pre-populated to 'default'.
        '#selection_settings' => [
          'target_bundles' => ['agency'],
        ],
      ];
    }
    else {
      $user = User::load($current_user->id());
      $field_agency_reference = $user->get('field_agency_reference')->target_id;
      $form['agency'] = [
        '#type' => 'hidden',
        '#required' => TRUE,
        '#default_value' => $field_agency_reference
      ];
    }
    /*
    $form['table-markup'] = [
      '#type' => 'table',
      '#header' => ['field_uuid', 'field_student_first_name', 'field_student_last_name', 'field_date_of_birth', 'Grant Number', 'Location', 'Classroom', 'PA Email', 'PA First Name', 'PA Last Name', 'PA Phone', 'SA Email', 'SA First Name', 'SA Last Name', 'SA Phone'],
      '#rows' => [['StudentID', 'First Name', 'Last Name', 'Birthday', 'Grant Number', 'Location', 'Classroom', 'PA Email', 'PA First Name', 'PA Last Name', 'PA Phone', 'SA Email', 'SA First Name', 'SA Last Name', 'SA Phone']],
      ''
    ];
    */

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => t('Import Student CSV'),
      '#button_type' => 'primary',
    ];

    return $form;
  }

  /**
   * @param array $form
   * @param FormStateInterface $form_state
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $csvFile = $form_state->getValue('file_upload');
    $csv_fid = current($csvFile);
    $parser = new CsvParser();
    $csv_parse = $parser->getCsvById($csv_fid);
    $this->file_id = $csv_fid;
    $this->file_name = $parser->csvFileName;
  }

  /**
   * @param array $form
   * @param FormStateInterface $form_state
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {

    $csvFile = $form_state->getValue('file_upload');
    $csv_fid = current($csvFile);
    $parser = new CsvParser();
    $csv_parse = $parser->getCsvById($csv_fid);

    $header_row = isset($csv_parse['0']) ? $csv_parse['0'] : [];
    $agency = $form_state->getValue('agency');

    $params = [
      'csv_data' => $csv_parse,
      'csv_fid' => $csv_fid,
      'header' => $header_row,
      'csvFileName' => $parser->csvFileName,
      'agency' => $agency
    ];

    $CsvStudentImport = new CsvStudentImport($params);
    $CsvStudentImport->process();
  }

}
