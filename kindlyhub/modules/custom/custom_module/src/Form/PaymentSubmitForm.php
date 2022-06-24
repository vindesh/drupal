<?php 
namespace Drupal\custom_module\Form;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\FormState;
use Drupal\node\Entity\Node;
use Drupal\uc_order\Entity\Order;
use Drupal\uc_order\OrderInterface;
use Drupal\uc_payment\Entity\PaymentMethod;
use Drupal\uc_payment\Plugin\PaymentMethodManager;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\CssCommand;
use Drupal\Core\Ajax\HtmlCommand;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Core\Ajax\InvokeCommand;
use Drupal\Core\Ajax\OpenModalDialogCommand;
use Drupal\taxonomy\Entity\Term;
use Drupal\Core\Url;
use Drupal\Component\Utility\Html;
use Drupal\uc_payment\PaymentMethodPluginInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\uc_payment\OffsitePaymentMethodPluginInterface;
use Drupal\Core\Config;


class PaymentSubmitForm  extends FormBase
{
	
	 public function getFormId() {
    return 'paypal_payment_form';
  }

/**
   * {@inheritdoc}
   */
public function orderView(OrderInterface $order) {
    $txn_id = db_query("SELECT txn_id FROM {uc_payment_paypal_ipn} WHERE order_id = :id ORDER BY received ASC", [':id' => $order->id()])->fetchField();
    if (empty($txn_id)) {
      $txn_id = $this->t('Unknown');
    }

    $build['#markup'] = $this->t('Transaction ID:<br />@txn_id', ['@txn_id' => $txn_id]);
    return $build;
  }

/**
   * {@inheritdoc}
   */

public function buildForm(array $form, FormStateInterface $form_state) {
  $current_path = \Drupal::service('path.current')->getPath();
  $path_argument = explode('/', $current_path);
  //dsm($path_argument);
  $order = Order::load($path_argument[2]);
  $path_args = $_GET;
  $mid = $path_args['mid'];
  $plugin = PaymentMethod::load($mid);
  $test= $plugin->get('settings');
  $mail = $test['wps_email'];
  $lang =$test['wps_language'];
  $server =$test['wps_server'];
  $action =$test['wps_payment_action'];
  $submit_method=$test['wps_submit_method'];
  $shipping =$test['wps_no_shipping'];
  $address = $test['wps_address_override'];
  $add_selection =$test['wps_address_selection'];
  $dbug = $test['wps_debug_ipn'];

 $shipping = 0;
    foreach ($order->line_items as $item) {
      if ($item['type'] == 'shipping') {
        $shipping += $item['amount'];
      }
    }

 $tax = 0;
    if (\Drupal::moduleHandler()->moduleExists('uc_tax')) {
      foreach (uc_tax_calculate($order) as $tax_item) {
        $tax += $tax_item->amount;
      }
    }

$address = $order->getAddress($test['wps_address_selection']);
$country = $address->getCountry();
$full_phone = trim($address->getPhone());
    $phone = '';
    for ($i = 0; $i < strlen($full_phone); $i++) {
      if (is_numeric($full_phone[$i])) {
        $phone .= $full_phone[$i];
      }
    }

    if ($country == 'US' || $country == 'CA') {
      $phone = substr($phone, -10);
      $phone_a = substr($phone, 0, 3);
      $phone_b = substr($phone, 3, 3);
      $phone_c = substr($phone, 6, 4);
    }
    else {
      $phone_a = $phone_b = $phone_c = '';
    }

    $data = [
      // PayPal command variable.
      'cmd' => '_cart',

      // Set the correct codepage.
      'charset' => 'utf-8',

      // IPN control notify URL.
      'notify_url' => Url::fromRoute('uc_paypal.ipn', [], ['absolute' => TRUE])->toString(),

      // Display information.
      'cancel_return' => Url::fromRoute('uc_cart.checkout_review', [], ['absolute' => TRUE])->toString(),
      'no_note' => 1,
      'no_shipping' => $test['wps_no_shipping'],
      'return' => Url::fromRoute('uc_paypal.wps_complete', ['uc_order' => $order->id()], ['absolute' => TRUE])->toString(),
      'rm' => 1,

      // Transaction information.
      'currency_code' => $order->getCurrency(),
      'handling_cart' => uc_currency_format($shipping, FALSE, FALSE, '.'),
      'invoice' => $order->id() . '-' . \Drupal::service('uc_cart.manager')->get()->getId(),
      'tax_cart' => uc_currency_format($tax, FALSE, FALSE, '.'),

      // Shopping cart specific variables.
      'business' => $test['wps_email'],
      'upload' => 1,

      'lc' => $test['wps_language'],

      // Prepopulating forms/address overriding.
      'address1' => substr($address->getStreet1(), 0, 100),
      'address2' => substr($address->getStreet2(), 0, 100),
      'city' => substr($address->getCity(), 0, 40),
      'country' => $country,
      'email' => $order->getEmail(),
      'first_name' => substr($address->getFirstName(), 0, 32),
      'last_name' => substr($address->getLastName(), 0, 64),
      'state' => $address->getZone(),
      'zip' => $address->getPostalCode(),
      'night_phone_a' => $phone_a,
      'night_phone_b' => $phone_b,
      'night_phone_c' => $phone_c,
    ];

    if ($test['wps_address_override']) {
      $data['address_override'] = 1;
    }

    // Account for stores that just want to authorize funds instead of capture.
    if ($test['wps_payment_action'] == 'Authorization') {
      $data['paymentaction'] = 'authorization';
    }

    if ($test['wps_submit_method'] == 'itemized') {
      // List individual items.
      $i = 0;
      foreach ($order->products as $item) {
        $i++;
        $data['amount_' . $i] = uc_currency_format($item->price->value, FALSE, FALSE, '.');
        $data['item_name_' . $i] = $item->title->value;
        $data['item_number_' . $i] = $item->model->value;
        $data['quantity_' . $i] = $item->qty->value;

        // PayPal will only display the first two...
        if (!empty($item->data->attributes)) {
          $o = 0;
          foreach ($item->data->attributes as $name => $setting) {
            $data['on' . $o . '_' . $i] = $name;
            $data['os' . $o . '_' . $i] = implode(', ', (array) $setting);
            $o++;
          }
        }
      }

      // Apply discounts (negative amount line items). For example, this handles
      // line items created by uc_coupon.
      $discount = 0;

      foreach ($order->line_items as $item) {
        if ($item['amount'] < 0) {
          // The discount amount must be positive.
          // The minus sign is not an error!
          $discount -= $item['amount'];
        }
      }

      if ($discount != 0) {
        $data['discount_amount_cart'] = $discount;
      }
    }
    else {
      // List the whole cart as a single item to account for fees/discounts.
      $data['amount_1'] = uc_currency_format($order->getTotal() - $shipping - $tax, FALSE, FALSE, '.');
      $data['item_name_1'] = $this->t('Order @order_id at @store', ['@order_id' => $order->id(), '@store' => uc_store_name()]);
    }

    $form['#action'] = $test['wps_server'];

    foreach ($data as $name => $value) {
     // dsm($name);
      if (!empty($value)) {
        $form[$name] = ['#type' => 'hidden', '#value' => $value];
      }
    }

    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Pay By PayPal'),
    ];
    //dsm($data);

    return $form;

  }

   /**
   * {@inheritdoc}
   */
   public function submitForm(array &$form, FormStateInterface $form_state) {
    $test['wps_email'] = trim($form_state->getValue('wps_email'));
    $test['wps_language'] = $form_state->getValue('wps_language');
    $test['wps_server'] = $form_state->getValue('wps_server');
    $test['wps_submit_method'] = $form_state->getValue('wps_submit_method');
    $test['wps_no_shipping'] = $form_state->getValue('wps_no_shipping');
    $test['wps_address_override'] = $form_state->getValue('wps_address_override');
    $test['wps_address_selection'] = $form_state->getValue('wps_address_selection');
    $test['wps_debug_ipn'] = $form_state->getValue('wps_debug_ipn');
  }
}