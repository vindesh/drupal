<?php
/**
 * @file
 * Contains \Drupal\custom_module\Plugin\Block\Role_expirationBlock.
 */
namespace Drupal\custom_module\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Routing;
use Drupal\user\Entity\User;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;


/**
 * Provides a 'Role_expirationBlock' block.
 *
 * @Block(
 *   id = "Role_expirationBlock",
 *   admin_label = @Translation("role expiration"),
 *   category = @Translation("Custom role expiration block ")
 * )
 */
class Role_expirationBlock  extends BlockBase {
  /**
   * {@inheritdoc}
   */
public function build() {
$user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
$uid = $user->get('uid')->value;
$sql = db_select('uc_roles_expirations', 'i') 
       ->fields('i',['expiration'])
       ->condition('i.uid', $uid ,'=')
       ->execute()
       ->fetchField();
$mysqltime =date("F j, Y - H:i",$sql );

return[
'#markup'=> '<div ><strong>Role Expiration date :   </strong>'.$mysqltime.'</div>',
];
}



protected function blockAccess(AccountInterface $account) {
  $roles = \Drupal::currentUser()->getRoles();
  if (in_array('agency_administrator', $roles)) {
    return AccessResult::allowed();
  }else{
  	return AccessResult::forbidden();
  }
  
  }

   }
