<?php

namespace Drupal\kh_agencies\Plugin\Action;

use Drupal\views_bulk_operations\Action\ViewsBulkOperationsActionBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\views_bulk_operations\Action\ViewsBulkOperationsPreconfigurationInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\node\Entity\Node;
use Drupal\Core\Session\AccountInterface;
use Drupal\views_bulk_operations\Service\ViewsbulkOperationsViewData;
use Drupal\views_bulk_operations\Service\ViewsBulkOperationsActionProcessor;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Url;
/**
 * Content update goal field.
 *
 * @Action(
 *   id = "goals_node_action",
 *   label = @Translation("Goals bulk update"),
 *   type = "node",
 *   confirm = FALSE
 * )
 */

class BulkGoalsUpdateAction extends ViewsBulkOperationsActionBase implements ContainerFactoryPluginInterface, ViewsBulkOperationsPreconfigurationInterface {

  //use StringTranslationTrait;

   /**
   * Database conection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * Object constructor.
   *
   * @param array $configuration
   *   Plugin configuration.
   * @param string $plugin_id
   *   The plugin Id.
   * @param mixed $plugin_definition
   *   Plugin definition.
   * @param \Drupal\views_bulk_operations\Service\ViewsbulkOperationsViewData $viewDataService
   *   The VBO view data service.
   * @param \Drupal\views_bulk_operations\Service\ViewsBulkOperationsActionProcessor $actionProcessor
   *   The VBO action processor.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   Entity type manager.
   * @param \Drupal\Core\Entity\EntityTypeBundleInfoInterface $bundleInfo
   *   Bundle info object.
   * @param \Drupal\Core\Database\Connection $database
   *   Database conection.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ViewsbulkOperationsViewData $viewDataService, ViewsBulkOperationsActionProcessor $actionProcessor, EntityTypeManagerInterface $entityTypeManager, EntityTypeBundleInfoInterface $bundleInfo, Connection $database) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->viewDataService = $viewDataService;
    $this->actionProcessor = $actionProcessor;
    $this->entityTypeManager = $entityTypeManager;
    $this->bundleInfo = $bundleInfo;
    $this->database = $database;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('views_bulk_operations.data'),
      $container->get('views_bulk_operations.processor'),
      $container->get('entity_type.manager'),
      $container->get('entity_type.bundle.info'),
      $container->get('database')
    );
  }

   /**
   * {@inheritdoc}
   */
  public function buildPreConfigurationForm(array $form, array $values, FormStateInterface $form_state) {
    dpm($form);
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function execute(ContentEntityInterface $entity = NULL) {
    $add_values = $this->configuration['_add_values'];
    $goals_tids = $this->configuration['_goals_tids'] ;

    if ($entity->hasField('field_readiness_goals')) {
      $field_readiness_goals = $entity->get('field_readiness_goals')->getValue();
      $existing_rg = $update_rg = [];

      if ($add_values) {
        if ($field_readiness_goals) {
          foreach($field_readiness_goals as $rg) {
            $existing_rg[] = $rg['target_id'];
            $update_rg[] = $rg;
          }
        }
        foreach ($goals_tids as $g_tid) {
          if ($g_tid && !in_array($g_tid,$existing_rg )) {
            $update_rg[] = ['target_id' => $g_tid];
          }
        }
      }
      else {
        foreach ($goals_tids as $g_tid) {
          if ($g_tid) {
            $update_rg[] = ['target_id' => $g_tid];
          }
        }
      }
      $entity->set('field_readiness_goals', $update_rg);
      $entity->save();

      return $this->t(':title has been updated with the selected goals',
        [
          ':title' => $entity->getTitle()
        ]
      );
    }
    else {
      return $this->t(':title does not have goal field',
        [
          ':title' => $entity->getTitle()
        ]
      );
    }
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {

    // Disable cache to avoid errors with storing files in tempstore
    $form_state->disableCache();

    // Get view bundles.
    $goals = $this->getGoals();

    // Store entity data.
    $storage = $form_state->getStorage();
    $storage['vbe_entity_bundles_data'] = $bundle_data;
    $form_state->setStorage($storage);

    $form['#attributes']['class'] = ['views-bulk-edit-form'];

    $form['options'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Apply Themes'),
    ];
    $form['options']['_add_values'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Maintain existing theme(s) for selected student'),
      '#description' => $this->t('New selected themes of multi-value fields will be added to the existing ones instead of overwriting them.'),
    ];

    $form['options']['_goals_tids'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Select Themes'),
      '#required' => TRUE,
      '#options' => $goals,
      '#description' => $this->t('These goals will associated with selected students'),
    ];
    $current_path = \Drupal::service('path.current')->getPath();
    $form['options']['_add_goal'] = [
      '#type' => 'link',
      '#title' => $this->t('Add New Theme'),
      '#url' => Url::fromRoute('kh_agencies.add_goal', [], ['query' => ['destination'=>$current_path]]),

    ];
    return $form;
  }

    /**
   * Helper method to get bundles displayed by the view.
   *
   * @return array
   *   Array of goals taxonomy terms
   *   keyed by term TIDs.
   */
  protected function getGoals() {
    $goals_data = [];
    $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $agency_tid = $user->get('field_agency_reference')->target_id;
    $terms = $this->entityTypeManager->getStorage('taxonomy_term')->loadByProperties([
      'vid' => 'readiness_goal',
      'field_agency.target_id' => $agency_tid
    ]);
    if ($terms) {
      foreach ($terms as $term) {
        $goals_data[$term->id()] = $term->getName();
      }
    }
    return $goals_data;
  }
  /**
   * {@inheritdoc}
   */
  public function access($object, AccountInterface $account = NULL, $return_as_object = FALSE) {
    if ($object instanceof Node) {
      $can_update = $object->access('update', $account, TRUE);
      $can_edit = $object->access('edit', $account, TRUE);
      $student_tid = $object->get('field_agency')->target_id;
      $user = \Drupal\user\Entity\User::load($account->id());
      $user_agency_tid = $user->get('field_agency_reference')->target_id;

      $user_agency_tid = $user->get('field_agency_reference')->target_id;
      if ($student_tid == $user_agency_tid) {
        return TRUE;
      }
      else {
        return FALSE;
      }
    }
    return FALSE;
  }

  /**
   * Save modified entity field values to action configuration.
   *
   * @param array $form
   *   Form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form_state object.
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    $this->configuration['_add_values'] = $form_state->getValue('_add_values');
    $this->configuration['_goals_tids'] = $form_state->getValue('_goals_tids');
  }
}
