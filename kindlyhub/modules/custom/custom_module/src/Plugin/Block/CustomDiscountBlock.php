<?php
/**
 * @file
 * Contains \Drupal\custom_module\Plugin\Block\CustomDiscountBlock.
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
 *   id = "discount_block",
 *   admin_label = @Translation("Custom Discount Block"),
 *   category = @Translation("Custom Payment block example")
 * )
 */
class CustomDiscountBlock extends BlockBase {
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
  $form = \Drupal::formBuilder()->getForm('Drupal\custom_module\Form\DiscountCouponForm');

  return $form;
}




protected function blockAccess(AccountInterface $account) {
  $uid = \Drupal::currentUser()->id();

    return AccessResult::allowed();
  }

  //  return AccessResult::allowedIfHasPermission($account, 'access content');
  }

