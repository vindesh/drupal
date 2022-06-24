<?php
/**
 * @file
 * Add goal Form.
 */

namespace Drupal\kh_agencies\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\taxonomy\Entity\Term;

/**
 * @ingroup kh_agencies
 */
class AddGoalForm extends FormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'add-goal';
  }

  /**
   * Form constructor.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   *
   * @return array
   *   The form structure.
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['makup-title'] = [
      '#type' => 'markup',
      '#markup' => '<h2>Add Theme</h2>'
    ];

    $form['title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Title'),
      '#required' => TRUE
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
      '#attributes' => [
        'class' => ['btn', 'btn-primary']
      ]
    ];
    $params = \Drupal::request()->query->all();
    if (!empty($params['destination'])) {
      $url = \Drupal\Core\Url::fromUserInput($params['destination']);
    }
    else {
      $url = \Drupal\Core\Url::fromUserInput('/manage-themes');
    }
    $form['cancel'] = [
      '#type' => 'link',
      '#title' => $this->t('Cancel'),
      '#url' => $url,
      '#attributes' => [
        'class' => ['btn', 'btn-cancel']
      ]
    ];


    return $form;
  }
  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {

  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $agency_tid = $user->get('field_agency_reference')->target_id;
    $region_tid = $user->get('field_user_regional_reference')->target_id;

    $term = Term::create(array(
      'vid' => 'readiness_goal',
      'name' =>  $form_state->getValue('title'),
      'field_agency' => ['target_id' => $agency_tid],
      'field_region' => ['target_id' => $region_tid]
    ))->save();
  }
}
