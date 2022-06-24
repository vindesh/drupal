<?php

namespace Drupal\custom_module\Plugin\Action;

use Drupal\node\Entity\Node;
use Drupal\views_bulk_operations\Action\ViewsBulkOperationsActionBase;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Entity\ContentEntityInterface;

/**
 * In-kind Donation Content Update.
 *
 * @Action(
 *   id = "custom_module_inkind_donation_node_action",
 *   label = @Translation("In-kind Donation Node Action"),
 *   type = "node",
 *   confirm = TRUE
 * )
 */

class InkindDonationNodeAction extends ViewsBulkOperationsActionBase {

  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function execute(ContentEntityInterface $entity = NULL) {

    $sid = $entity->field_for_student->getValue();
    $sid = (count($sid) > 0 ? $sid[0]['target_id'] : FALSE);
    $message = '';
    if($sid) {
      $student = \Drupal::entityTypeManager()->getStorage('node')->load($sid);
      //Update Grant, pull from student entity.
      if($student){
        $fundedby = $student->get('field_funded_by')->getValue();
        $fundedby = (count($fundedby) > 0 ? $fundedby[0]['target_id'] : FALSE);
        if($fundedby) {
          $grant_entity = \Drupal::entityTypeManager()->getStorage('node')->load( $fundedby );
          $entity->set('field_funded_by', $grant_entity);

          //Update Hourly rate - pull from Grant or Agency entity.
          $hourly_rate = $student->get('field_funded_by')->entity->get('field_current_year_hourly_rate')->value;
          if( !empty($hourly_rate) && $hourly_rate > 0 ){
              //Assign Grant hourly rate.
              $entity->set('field_hourly_rate',  $hourly_rate );
          }else{
              //Assign Grant hourly rate.
              $hourly_rate = $student->get('field_agency')->entity->get('field_hourly_rate_i_e_16_95')->value;
              $entity->set('field_hourly_rate',  $hourly_rate );
          }
        }else{
          $message = 'Student ID: ' . $sid.' - No grant attached with this student!';
        }
      }else{
        $message = 'Student ID: ' . $sid.' - Student not found!';
      }

    }else{
      //$hourly_rate = $entity->get('field_agency')->entity->get('field_hourly_rate_i_e_16_95')->value;
      //$entity->set('field_hourly_rate',  $hourly_rate );
      $message = 'Entity ID: ' . $entity->id().' -  No student data found for this donation! ';
    }

    $entity->save();

    if(empty($message) ){
      $message = 'Updated Entity ID: ' . $entity->id()
              .' | ' . 'Houly Rate:' . $hourly_rate
              . 'Grant:'. $student->field_funded_by->getValue()[0]['target_id'];
    }
    // \Drupal::messenger()->addMessage($message);
     \Drupal::logger('InkindDonationNodeAction')->notice($message);
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
