<?php
/**
 * @file
 * Contains \Drupal\kh_import\Form\SendNotificationForm.
 */
namespace Drupal\kh_import\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\Form;
use Drupal\kh_import\CsvParser;
use Drupal\kh_import\CsvSendNotification;

/**
 * Members Import form.
 */

class SendNotificationForm extends FormBase {


  public function getFormID() {
    return 'send_notification_import';
  }

  /**
   * @param array $form
   * @param FormStateInterface $form_state
   * @return array
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['file_upload'] = [
      '#type' => 'managed_file',
      '#title' => t('Upload CSV File'),
      '#size' => 40,
      '#description' => t('Upload csv file for sent notification to the user, please make sure user\'s to whom notify should already imported or exist in the database'),
      '#required' => TRUE,
      '#autoupload' => TRUE,
      '#upload_validators' => ['file_validate_extensions' => ['csv']]
    ];

    $form['notification'] = [
      '#type' => 'markup',
      '#markup' => '<p><b>' .
        t('To avoid the duplicate notification, please make sure the duplicate email should not exist in the uploaded CSV') .
        '</b><br>' .
        t('In order to send email, please make sure the CSV should have one or more out of the column <b>"mail", "pa_email", "sa_email"</b>') . '<br>' .
        t('In order to send SMS, please make sure the CSV should have one or more out of the column <b>"pa_phone", "sa_phone"</b>') . '</p>',
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => t('Send Notification'),
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
    $params = [
      'csv_data' => $csv_parse,
      'csv_fid' => $csv_fid,
      'header' => $header_row,
      'csvFileName' => $parser->csvFileName
    ];
    $CsvSendNotification = new CsvSendNotification($params);
    $CsvSendNotification->process();
  }
}
