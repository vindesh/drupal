<?php

namespace Drupal\custom_module\Plugin\Action;

use Drupal\node\Entity\Node;
use Drupal\views_bulk_operations\Action\ViewsBulkOperationsActionBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Entity\ContentEntityInterface;

/**
 * In-kind Donation Calculate Total Amount and Update.
 *
 * @Action(
 *   id = "custom_module_inkind_donation_amount_update_action",
 *   label = @Translation("In-kind Donation Total Amount Update Action"),
 *   type = "node",
 *   confirm = TRUE
 * )
 */

class InkindDonationTotalAmountAction extends ViewsBulkOperationsActionBase {

  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function execute(ContentEntityInterface $entity = NULL) {

    $total_amount = 0;
    if($activity_time = kindlyhub_inkind_donation_activity_time($entity)){
      //$entity->set('field_minutes', $activity_time['minute']);
      $total_amount = round($activity_time['hour'] * $entity->get('field_hourly_rate')->value, 2);
      $entity->set('field_donation_amount', $total_amount );

      //Case-Donation of Goods or Services
      $inkind_donation_type = $entity->field_which_type_of_in_kind_dona->getValue();
      $inkind_donation_type = (count($inkind_donation_type) > 0 )? $inkind_donation_type[0]['target_id'] : FALSE;
      if($inkind_donation_type && $inkind_donation_type == 52){
        $entity->set('field_hourly_rate', 0);
        $entity->set('field_minutes', 0);
        $entity->set('field_doctor_visit_mileage', 0);
        $entity->set('field_donation_amount', 0);
        $entity->set('field_hour', NULL);
      }////

      $entity->save();
    }

    $message = 'Updated Entity ID: ' . $entity->id()
              .' | ' . 'field_donation_amount: ' . $total_amount;
    // \Drupal::messenger()->addMessage($message);
     \Drupal::logger('InkindDonationTotalAmountAction')->notice($message);
    return $message;
  }

  /**
   * {@inheritdoc}
   */
  public function access($object, AccountInterface $account = NULL, $return_as_object = FALSE) {
    // if ($object instanceof Node) {
    //   $can_update = $object->access('update', $account, TRUE);
    //   $can_edit = $object->access('edit', $account, TRUE);

    //   return $can_edit->andIf($can_update)->isAllowed();
    // }

    // return FALSE;

    if ($object->getEntityType() === 'node') {
      $access = $object->access('update', $account, TRUE)
        ->andIf($object->status->access('edit', $account, TRUE));
      return $return_as_object ? $access : $access->isAllowed();
    }

    // Other entity types may have different
    // access methods and properties.
    return TRUE;

  }
}
