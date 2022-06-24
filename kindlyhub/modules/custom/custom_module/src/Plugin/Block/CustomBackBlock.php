<?php
/**
 * @file
 * Contains \Drupal\custom_module\Plugin\Block\CustomBackBlock.
 */
namespace Drupal\custom_module\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Routing;
use Drupal\user\Entity\User;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;


/**
 * Provides a 'CustomBackBlock' block.
 *
 * @Block(
 *   id = "CustomBackBlock",
 *   admin_label = @Translation("CustomBackBlock"),
 *   category = @Translation("Custom role expiration block ")
 * )
 */
class CustomBackBlock  extends BlockBase {
  /**
   * {@inheritdoc}
   */
  public function build() {

    $current_path = \Drupal::service('path.current')->getPath();
    $path_args = explode('/', $current_path);
    $query = $_GET;
    $path_args1 = explode('?', $query['destination']);

    //@vm0209
    // print 'Custombackblock: ';  print'<pre>';
    // print_r($path_args);
    // print_r($path_args1);
    // print '</pre>';
    if($path_args[1] == 'node' && !empty($path_args1[0])) {
      if(!empty($path_args1[1])){
        return['#markup'=>'<a href = "'.$path_args1[0].'?'.$path_args1[1].'" type ="button" class = "back-button" title = "Back"></a>',
      ];
      }
      else
      return['#markup'=>'<a href = "'.$path_args1[0].'" type ="button" class = "back-button" title = "Back"></a>',
      ];
    }
    if($path_args[1] == 'user' && !empty($path_args1[0])) {
      return['#markup'=>'<a href = "'.$path_args1[0].'" type ="button" class = "back-button" title = "Back"></a>',
      ];
    }
    //@end-vm0209


    // if($path_args1[0] == 'user-dashboard' && !empty($path_args1[1])) {
    //   return['#markup'=>'<a href = "/dashboard?'.$path_args1[1].'" type ="button" class = "back-button" title = "Back"></a>',
    //   ];
    // }
    if($path_args[1] == 'edit' && ($path_args[2] == 'family-detail' || $path_args[2] == 'location-detail')) {
      //return['#markup'=>'<a href = "/bbbb-user-dashboard?quicktabs-tabpage-sidebar_quick_tabs-2" type ="button" class = "back-button" title = "Back"></a>',];
      return['#markup'=>'<a href = "'.$path_args1[0].'" type ="button" class = "back-button" title = "Back"></a>',];
    }
  }


  protected function blockAccess(AccountInterface $account) {
    $roles = \Drupal::currentUser()->getRoles();
    if (in_array('authenticated', $roles)) {
      return AccessResult::allowed();
    }else{
    	return AccessResult::forbidden();
    }

  }

}
