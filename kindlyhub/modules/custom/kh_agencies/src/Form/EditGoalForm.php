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
class EditGoalForm extends FormBase {
  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'edit-goal';
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
  public function buildForm(array $form, FormStateInterface $form_state, $tid = null) {
    $form['makup-title'] = [
      '#type' => 'markup',
      '#markup' => '<h2>Edit Theme</h2>'
    ];
    $term = Term::load($tid);
    $form['title'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Title'),
      '#required' => TRUE,
      '#default_value' => $term->getName()
    ];
    $form['tid'] = [
      '#type' => 'hidden',
      '#default_value' => $term->id()
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
    /*
    $form['delete'] = [
      '#type' => 'link',
      '#title' => $this->t('Delete'),
      '#url' => \Drupal\Core\Url::fromRoute('entity.taxonomy_term.delete_form', ['taxonomy_term' =>$term->id()], ['query' => ['destination' => '/manage-themes']]),
      '#attributes' => [
        'class' => ['btn', 'btn-danger']
      ]
    ];*/
    return $form;
  }
  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    /*$values = $form_state->getValues();
    $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $agency_tid = $user->get('field_agency_reference')->target_id;
    $terms = $this->entityTypeManager->getStorage('taxonomy_term')->loadByProperties([
      'vid' => 'readiness_goal',
      'name' => trim($values['title']),
      'field_agency.target_id' => $agency_tid
    ]);

    if (count($terms) > 0 ) {
      $form_state->setErrorByName('title', t('Goal <em>@title</em> already exist', ['@title' => $values['title'] ]));
    }*/
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $agency_tid = $user->get('field_agency_reference')->target_id;
    $region_tid = $user->get('field_user_regional_reference')->target_id;
    $term = Term::load( $form_state->getValue('tid'));
    $term->set('name',  $form_state->getValue('title'));
    $term->save();
  }
}
