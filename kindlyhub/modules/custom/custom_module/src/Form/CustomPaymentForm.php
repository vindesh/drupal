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
use \Drupal\uc_payment\PaymentMethodPluginInterface;
use Drupal\uc_payment\Annotation\UbercartPaymentMethod;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\Core\Plugin\DefaultPluginManager;
use Drupal\uc_credit\CreditCardPaymentMethodBase;

/**
 * 
 */
class CustomPaymentForm extends FormBase
{
  
public function getFormId() {
  return 'paytm_payment_form';
  }

public function getPlugin() {
 return \Drupal::service('plugin.manager.uc_payment.method')->createInstance($this->plugin, $this->settings);
}

public function getDisplayLabel() {
    $build = $this->getPlugin()->getDisplayLabel($this->label());
    return \Drupal::service('renderer')->renderPlain($build);
  }


/**
* {@inheritdoc}
*/
public function buildForm(array $form, FormStateInterface $form_state) {
$form['#attached']['library'][] = 'uc_payment/uc_payment.styles';
$current_path = \Drupal::service('path.current')->getPath();
$path_args = explode('/', $current_path);
$order_load = Order::load($path_args[4]);
$payment_method = $order_load->get('payment_method')->value;
$input = $form_state->getUserInput();
unset($input['panes']['payment']['payment_method']);
$form_state->setUserInput($input);
$methods = PaymentMethod::loadMultiple();
$method= $methods['paypal'];
$method1 = $methods['pay_by_credit_card'];

$options = [];
foreach ($methods as $method) {
    $plugin = $method->getPlugin();
    $pluginid =$plugin->getpluginId();
      if ($method->status()) {
      $options[$method->id()] = $method->getDisplayLabel();
      }
 }
 unset($options['pay_by_invoice']);
unset($options['pay_by_check']);

  \Drupal::moduleHandler()->alter('uc_payment_method_checkout', $options, $order_load); 

    $form['payment_method'] = array(
      '#type' => 'radios',
      '#title' => $this->t('Payment method'),
      '#title_display' => 'invisible',
      '#options' => $options,
    );
     if ($order_load->getPaymentMethodId()) {
      $plugins = $method1->getPlugin(); 
      $definition = $plugins->getPluginDefinition();
      //dsm($definition);
      $form['details'] = [
        '#prefix' => '<div id="payment-details" class="clearfix ' . Html::cleanCssIdentifier('payment-details-' . $definition['id']) . '">',
        '#markup' => $this->t('Continue with checkout to complete payment.'),
        '#suffix' => '</div>',
      ];

      try {
        $details = $plugins->cartDetails($order_load, $form, $form_state);
        if ($details) {
          unset($form['details']['#markup']);
          $form['details'] += $details;
        }
      }
      catch (PluginException $e) {
      }
    }
    $form['actions']['submit_2'] = array(
      '#type' => 'submit',
      '#value' => t('Review Order'),
      '#submit' => array('::newSubmissionHandlerTwo'),
    );

    $form['actions']['#type'] = 'actions';
    $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#value' => $this->t('Review'),
      '#button_type' => 'primary',
    );
   return $form;

}
 
public function submitForm(array &$form, FormStateInterface $form_state) {
 $stripe_token_val = $form_state->getValue('stripe_token');
 $session = \Drupal::service('session');
 $session->set('tokenid', $stripe_token_val);
 $cc_data1 = $form_state->getValue(['details']['cc_number']);
 $cc_num =$cc_data1['cc_number'];
 $cc_exp_month =$cc_data1['cc_exp_month'];
 $cc_exp_year = $cc_data1['cc_exp_year'];
 $cc_cvv = $cc_data1['cc_cvv'];
 $stripe_nojs_warning = $cc_data1['stripe_nojs_warning'];
 $stripe_token =$cc_data1['stripe_token'];
 $cc_data =[
  'cc_number' => $cc_num,
  'cc_exp_month'=> $cc_exp_month,
  'cc_exp_year'=>$cc_exp_year,
  'cc_cvv'  =>$cc_cv,
  'stripe_nojs_warning' =>  $stripe_nojs_warning,
  'stripe_token' => $stripe_token_val,

];
$cc_data['cc_number'] = str_replace(' ', '', $cc_data['cc_number']);
// Recover cached CC data in form state, if it exists.
    if (isset($cc_data['payment_details_data'])) {
      $cache = uc_credit_cache(base64_decode($cc_data['payment_details_data']));
      unset($cc_data['payment_details_data']);
    }
  // Account for partial CC numbers when masked by the system.
    if (substr($cc_data['cc_number'], 0, strlen(t('(Last4)'))) == $this->t('(Last4)')) {
      // Recover the number from the encrypted data in the form if truncated.
      if (isset($cache['cc_number'])) {
        $cc_data['cc_number'] = $cache['cc_number'];
      }
      else {
        $cc_data['cc_number'] = '';
      }
    }
 if (!empty($cc_data['cc_cvv']) && $cc_data['cc_cvv'] == str_repeat('-', strlen($cc_data['cc_cvv']))) {
      if (isset($cache['cc_cvv'])) {
        $cc_data['cc_cvv'] = $cache['cc_cvv'];
      }
      else {
        $cc_data['cc_cvv'] = '';
      }
    }
    $order->payment_details = $cc_data;
    $return = TRUE;
    $key = uc_credit_encryption_key();
    $crypt = \Drupal::service('uc_store.encryption');
    $session = \Drupal::service('session');
    $session->set('cc_data', $cc_data);
    $session->set('sescrdval', $crypt->encrypt($key, base64_encode(serialize($order->payment_details))));
    uc_store_encryption_errors($crypt, 'uc_credit');
    $methodid =$form_state->getValue('payment_method');
    $current_path = \Drupal::service('path.current')->getPath();
    $path_args = explode('/', $current_path);
    $response = new RedirectResponse('/orders-summary/'.$path_args[4].'?mid='.$methodid);
    $form_state->setResponse($response);
     return $return;

    }

 public function newSubmissionHandlerTwo(array &$form, FormStateInterface $form_state) {
  //dsm($form_state);
    $methodid =$form_state->getValue('payment_method');
     $current_path = \Drupal::service('path.current')->getPath();
    $path_args = explode('/', $current_path);
    if($methodid == 'paypal'){
    $response = new RedirectResponse('/order-summary/'.$path_args[4].'?mid='.$methodid);
    $form_state->setResponse($response);
  }

  }
  }