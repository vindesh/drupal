<?php
/**
 * @file
 * Contains \Drupal\kh_import\Form\ImportStaffForm.
 */
namespace Drupal\kh_import\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\Form;
use Drupal\kh_import\CsvParser;
use Drupal\kh_import\CsvStaffImport;
use Drupal\user\Entity\User;
/**
 * Members Import form.
 */

class ImportStaffForm extends FormBase {


  public function getFormID() {
    return 'csv_staff_import';
  }

  /**
   * @param array $form
   * @param FormStateInterface $form_state
   * @return array
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['file_upload'] = [
      '#type' => 'managed_file',
      '#title' => t('Upload Staff CSV File'),
      '#size' => 40,
      '#description' => t('Upload the staff\'s CSV file to be import. All staff will be import as drupal users'),
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
        '#default_value' => $field_agency_reference
      ];
    }

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => t('Import Staff CSV'),
      '#button_type' => 'primary',
    ];

    return $form;
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
    $notification = $form_state->getValue('notification');
    $params = [
      'csv_data' => $csv_parse,
      'csv_fid' => $csv_fid,
      'header' => $header_row,
      'csvFileName' => $parser->csvFileName,
      'agency' => $agency,
      'notification' => $notification
    ];

    $CsvStaffImport = new CsvStaffImport($params);
    $CsvStaffImport->process();
  }


}
