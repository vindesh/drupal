<?php
/**
 * @file
 * Contains \Drupal\custom_module\Plugin\Block\CustomMangeDonationBlock.
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
 *   id = "custom_managedonation_block",
 *   admin_label = @Translation("custom managedonation  Block"),
 *   category = @Translation("Custom")
 * )
 */
class CustomMangeDonationBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */

  public function build() {
    $user = \Drupal::currentUser();
    $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $uid = $user->id();
    $roles = $user->getRoles();
    $flagDonationType = \Drupal::request()->get('donationtype');
    $form['form'] = [];
    if(in_array('agency_administrator', $roles) || in_array('agency_manager', $roles)){
      if($flagDonationType == 'approved')
      {
        $form['form']= views_embed_view('manage_agency_school', 'block_4_approved');
      }
      else if($flagDonationType == 'reject')
      {
        $form['form']= views_embed_view('manage_agency_school', 'block_4_reject');
      }
      else
      {
        $form['form']= views_embed_view('manage_agency_school', 'block_4');
      }
    }

    if(in_array('teacher', $roles) && !in_array('administrator', $roles)){
      $form['form']= views_embed_view('classroom_users', 'block_1');
    }

    if( ( in_array('staff_with_approval', $roles) || in_array('school_manager', $roles) ) && !in_array('administrator', $roles)){
      
      if($flagDonationType == 'approved') {
        $form['form']= views_embed_view('manage_agency_school', 'block_6_approved');
      }
      else if($flagDonationType == 'reject') {
        $form['form']= views_embed_view('manage_agency_school', 'block_6_reject');
      } else {
        $form['form']= views_embed_view('manage_agency_school', 'block_6');
      }
  }



    // $form['form3'] = views_embed_view('classroom_users', 'attachment_1',  $uid);
    // $form['form4']= views_embed_view('classroom_users', 'page_7', $uid);
    // $form['form5']= views_embed_view('classroom_users', 'attachment_2', $uid);

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

