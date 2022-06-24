<?php
/**
 * @file
 * Contains \Drupal\custom_module\Plugin\Block\CustompaymentBlock.
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
 * Provides a 'article' block.
 *
 * @Block(
 *   id = "article_block",
 *   admin_label = @Translation("Payment block"),
 *   category = @Translation("Custom Payment block example")
 * )
 */
class CustompaymentBlock extends BlockBase {
  /**
   * {@inheritdoc}
   */
public function getPlugin() {
    return \Drupal::service('plugin.manager.uc_payment.method')->createInstance($this->plugin, $this->settings);
  }

// public function getDisplayLabel() {
//     $build = $this->getPlugin()->getDisplayLabel($this->label());
//     return \Drupal::service('renderer')->renderPlain($build);
//   }

public function build() {
  $form = \Drupal::formBuilder()->getForm('Drupal\custom_module\Form\CustomPaymentForm');
  return $form; 
}






protected function blockAccess(AccountInterface $account) {
  $current_path = \Drupal::service('path.current')->getPath();
  $path_args = explode('/', $current_path);
  $uid = \Drupal::currentUser()->id();
  $order_load = Order::load($path_args[4]);
  //dsm($order_load);
  $payment_methode1 = $order_load->get('payment_method')->getValue();
  $payment_methode =$payment_methode1[0]['value'];
  //dsm($payment_methode);
  if($payment_methode != 'pay_by_invoice'){
  return AccessResult::forbidden();
  }
  //if()
  $return = accessCheckUser($order_load);

if (!$return) {
     // Return 403 Access Denied page.  
     return AccessResult::forbidden();
    }
    return AccessResult::allowed();
  }

  // //  return AccessResult::allowedIfHasPermission($account, 'access content');
   }

