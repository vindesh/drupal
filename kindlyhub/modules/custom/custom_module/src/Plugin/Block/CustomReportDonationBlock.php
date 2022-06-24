<?php
/**
 * @file
 * Contains \Drupal\custom_module\Plugin\Block\CustomReportDonationBlock.
 */

namespace Drupal\custom_module\Plugin\Block;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\block\Entity\Block;
use Drupal\node\Entity\Node;
use Drupal\Core\Controller\ControllerBase ;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Component\Utility\Html ;
use \Drupal\Core\Routing;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;


/**
 * Provides a 'Custom Site Content' block.
 *
 * @Block(
 *   id = "CustomReportDonationBlock",
 *   admin_label = @Translation("custom reportdonation  Block"),
 *   category = @Translation("Custom")
 * )
 */
class CustomReportDonationBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */

  public function build() {
    $user = \Drupal::currentUser();
    $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $uid = $user->id();
    $roles = $user->getRoles();

    if(in_array('agency_administrator', $roles) || in_array('agency_manager', $roles)){
    $form['form']= views_embed_view('classroom_users', 'block_9');
  }

    // $form['form1'] = views_embed_view('classroom_users', 'attachment_1',  $uid);
    // $form['form2']= views_embed_view('classroom_users', 'page_7', $uid);
    // $form['form3']= views_embed_view('classroom_users', 'attachment_2', $uid);
    // $form['form4']= views_embed_view('classroom_users', 'attachment_3', $uid);


     return $form;

}
  
 

// protected function blockAccess(AccountInterface $account) {
//     $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
//     $roles = $user->getRoles();

// if(in_array('administrator', $roles)){
//      return AccessResult::allowed();

//    }
// }


}

