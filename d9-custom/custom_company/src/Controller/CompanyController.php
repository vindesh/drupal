<?php
namespace Drupal\custom_company\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Link;
use Drupal\Core\Url;


/**
 * Class CompanyController.
 *
 * @package Drupal\custom_company\Controller
 */
class CompanyController extends ControllerBase {

  protected $entityTypeManager;

  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
      $this->entityTypeManager = $entity_type_manager;
  }

  public static function create(ContainerInterface $container) {
      return new static(
        $container->get('entity_type.manager'),
      );
  }

  public function listUsers() {

    // Prepare _sortable_ table header
      $header = array(
        ['data' => t('UID'), 'field' => 'uid',  'sort' => 'desc'],
        ['data' => t('Name'), 'field' => 'name'],
        ['data' => t('Email'), 'field' => 'mail'],
        ['data' => t('First Name'), 'field' => 'field_first_name'],
        ['data' => t('Last name'), 'field' => 'field_last_name'],
        ['data' => t('Full name'), 'field' => 'field_full_name'],
        ['data' => t('Company Name'), 'field' => 'field_company_name'],
        ['data' => t('Comapny'), 'field' => 'field_company'],
        ['data' => t('Account ID'), 'field' => 'field_account_id'],
        ['data' => t('Contact ID'), 'field' => 'field_contact_id'],
        ['data' => t('Status'), 'field' => 'status',],
        ['data' => t('Created'), 'field' => 'created'],
        ['data' => t('Operations'), 'field' => 'op'],
      );

    $uids = \Drupal::entityQuery('user')
      ->condition('field_company', '', '!=')
      ->condition('status', 1)
      ->sort('field_first_name', 'ASC')
      ->execute();

    if (!empty($uids)) {
      //$users = EntityInterface::loadMultiple( $ids );
      $users = $this->entityTypeManager->getStorage('user')
        ->loadMultiple( $uids );
      $rows = [];
      foreach($users as $user => $fieldValue) {
        //$rows[] = array('data' => [] $row);
        //dump($fieldValue->field_company->getValue());exit;
        if($fieldValue){
          $rows[] = ['data' => [
            'uid' => $fieldValue->uid->value,
            'name' => $fieldValue->name->value,
            'mail' => $fieldValue->mail->value,
            'field_first_name' => $fieldValue->field_first_name->value,
            'field_last_name' => $fieldValue->field_last_name->value,
            'field_full_name' => $fieldValue->field_full_name->value,
            'field_company_name' => $fieldValue->field_company_name->value,
            'field_company' => $fieldValue->field_company->getValue()[0]['target_id'],
            'field_account_id' => $fieldValue->field_account_id->value,
            'field_contact_id' => $fieldValue->field_contact_id->value,
            'status' => $fieldValue->status->value,
            'created' => $fieldValue->created->value,
            'op' => t(' Edit '),
          ]];
        }
      }



      $build = array(
          '#markup' => t('List of All Users')
      );
      $build['company_user_table'] = array(
        '#theme' => 'table', '#header' => $header,
          '#rows' => $rows
      );
    }

    return [
      '#type' => 'markup',
      //'#markup' => $this->t('List of All Users'),
      $build
    ];
  }
}
