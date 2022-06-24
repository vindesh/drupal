<?php
/**
 * @file
 * Contains \Drupal\custom_module\Plugin\Block\CustomstripymentBlock.
 */

namespace Drupal\custom_module\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Routing;
use Drupal\uc_order\Entity\Order;
use Drupal\uc_payment\Entity\PaymentMethod;
use Drupal\uc_payment\Plugin\PaymentMethodManager;
use Drupal\uc_order\OrderInterface;
use Drupal\Core\Render\Markup;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Component\Utility\Html;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\FormInterface;
use Drupal\uc_cart\CheckoutPanePluginBase;
use Drupal\uc_payment\ExpressPaymentMethodPluginInterface;
use Drupal\uc_payment\Form\OffsitePaymentMethodForm;
use Drupal\uc_payment\OffsitePaymentMethodPluginInterface;
use Drupal\Core\Plugin\PluginFormInterface;
use Drupal\Core\Plugin\DefaultPluginManager;
use Drupal\Core\Url;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;




/**
 * Provides a 'CustomstripymentBlock' block.
 *
 * @Block(
 *   id = "CustomstripymentBlock",
 *   admin_label = @Translation("pay by stripe"),
 *   category = @Translation("Custom Payment block example")
 * )
 */
class CustomstripymentBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
public function build() {
$current_path = \Drupal::service('path.current')->getPath();
$path_args = explode('/', $current_path);
//dsm($path_args);
$form = \Drupal::formBuilder()->getForm('Drupal\custom_module\Form\StripPaymentForm');
  return $form; 
// return[
// '#markup'=> 'HIII',
// ];
}


protected function blockAccess(AccountInterface $account) {
   $current_path = \Drupal::service('path.current')->getPath();
  $path_args = explode('/', $current_path); 
  $uid = \Drupal::currentUser()->id();
  $order_load = Order::load($path_args[2]);
  $order_status = $order_load->get('order_status')->getValue();
  $statusid = $order_status[0]['target_id'];
if ($statusid == 'completed'){
	 return AccessResult::forbidden();
}  
  $return = accessordercheck($account);
   if (!$return) {
     // Return 403 Access Denied page.  
     return AccessResult::forbidden();
    }
    return AccessResult::allowed();
  }

   }
