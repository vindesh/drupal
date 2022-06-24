<?php 
namespace Drupal\custom_module\Form;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\FormState;
use Drupal\node\Entity\Node;
use Drupal\uc_order\Entity\Order;
use Drupal\uc_order\Entity\OrderProduct;
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
use Drupal\Core\Link;
use Drupal\uc_payment\Entity\PaymentReceipt;
use Drupal\uc_payment\PaymentReceiptInterface;
use Drupal\uc_credit\CreditCardPaymentMethodBase;
use Drupal\uc_stripe\Plugin\Ubercart\PaymentMethod\StripeGateway;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Drupal\Core\Mail\MailManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;



class StripPaymentForm  extends FormBase
{

 /**
   * The mail manager service.
   *
   * @var \Drupal\Core\Mail\MailManagerInterface
   */
  protected $mailManager;
  
   
   public function getFormId() {
    return 'stripe_payment_form';
  }
   

    public function getEnabledFields() {
    return [
      'cvv' => TRUE,
      'owner' => FALSE,
      'start' => FALSE,
      'issue' => FALSE,
      'bank' => FALSE,
      'type' => FALSE,
    ];
  }
  public function __construct(MailManagerInterface $mail_manager) {
    $this->mailManager = $mail_manager;
  }

 public static function create(ContainerInterface $container) {
    return new static(
      $container->get('plugin.manager.mail')
    );
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
  $order = Order::load($path_argument[2]);
  $path_args = $_GET;
  $mid = $path_args['mid'];
  //$token = $path_args['token'];   
  $plugin = PaymentMethod::load($mid);   
  $configuration = $plugin->get('settings');
  $apikey = $configuration['testmode']
      ? $configuration['test_publishable_key']
      : $configuration['live_publishable_key'];
   $stripe_is_enabled = TRUE;
    $form['#attached']['drupalSettings']['uc_stripe']['publishable_key'] = $apikey;
    $form['#attached']['drupalSettings']['uc_stripe']['stripe_is_enabled'] = $stripe_is_enabled;
    $form['#attached']['library'][] = 'uc_stripe/uc_stripe';
   $session = \Drupal::service('session');
  if ($session->has('tokenid')) {  
    $token1= $session->get('tokenid');
    //dsm($token1);
   }
    $form['stripe_tokens'] = array(
       '#type' => 'hidden',
      '#default_value' => $token1,
      '#attributes' => array(
        'id' => 'edit-panes-payment-details-stripe-tokens',
      ),
    );

   $session = \Drupal::service('session');
  
  if ($session->has('sescrdval')) {

    $form['sescrd'] = [
      '#type' => 'hidden',
      '#value' => base64_encode($session->get('sescrdval')),
    ];
   // $session->remove('sescrdval');
  }
  elseif (isset($_POST['sescrdval'])) {
    // Copy and cache encrypted data that was POSTed in.
    $form['sescrd'] = [
      '#type' => 'hidden',
      '#value' => $_POST['sescrdval'],
    ];
    uc_credit_cache(base64_decode($_POST['sescrdval']));
  }
    $form['email'] = [
      '#type' => 'hidden',
      '#title' => $this->t('Recipient e-mail address'),
      '#default_value' => $order->getEmail(),
      '#required' => TRUE,
    ];

   $form['actions'] = ['#type' => 'actions'];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Pay By Stripe'),
    ];
    return $form;
}
  
  /**
   * {@inheritdoc}
   */
   public function submitForm(array &$form, FormStateInterface $form_state) {
    $stripe_token_val = $form_state->getValue('stripe_tokens');
    if (!empty($stripe_token_val)) {
      \Drupal::service('user.private_tempstore')->get('uc_stripe')->set('uc_stripe_token', $stripe_token_val);
    }
     $current_path = \Drupal::service('path.current')->getPath();
     $path_argument = explode('/', $current_path);
     $order = Order::load($path_argument[2]);
     $sale =$order->get('data')->getValue()[0]['complete_sale'];
     $mid = 'pay_by_credit_card';
     $plugin = PaymentMethod::load($mid);
     $configuration = $plugin->get('settings');
     $txn_type =$configuration['txn_type'];
      $line_items = $order->getDisplayLineItems();
      $amount = $line_items[0]['amount'];
     $user = \Drupal::currentUser();
    $session = \Drupal::service('session');
   if ($session->has('cc_data')) {
    $data1 =$session->get('cc_data');
    $key = uc_credit_encryption_key();
    $crypt = \Drupal::service('uc_store.encryption');
    $order->payment_details = $data1;
    $dataval=$crypt->encrypt($key, base64_encode(serialize($order->payment_details)));
    //dsm($dataval);
    }

     $data =array($dataval);
     //dsm($data);

  if (!$this->prepareApi()) {
      $result = array(
        'success' => FALSE,
        'comment' => t('Stripe API not found.'),
        'message' => t('Stripe API not found. Contact the site administrator.'),
        'uid' => $user->id(),
        'order_id' => $order->id(),
      );
      return $result;
    }
 // Format the amount in cents, which is what Stripe wants
    $amount = uc_currency_format($amount, FALSE, FALSE, FALSE);
    $stripe_customer_id = FALSE;
    if ($user->id() != $order->getOwnerId()) {
      $stripe_customer_id = $this->getStripeCustomerID($order->id());
    }
// Always Create a new customer in stripe for new orders
    if (!$stripe_customer_id) {
       try {
        // If the token is not in the user's session, we can't set up a new customer
        $stripe_token = \Drupal::service('user.private_tempstore')->get('uc_stripe')->get('uc_stripe_token');
       // dsm($stripe_token);
        if (empty($stripe_token_val)) {
          throw new \Exception('Token not found');
        }

        //Create the customer in stripe
        $customer = \Stripe\Customer::create(array(
            "source" => $stripe_token_val,
            'description' => "OrderID: {$order->id()}",
            'email' => $order->getEmail(),
          )
        );
        \Drupal::service('user.private_tempstore')->get('uc_stripe')->set('uc_stripe_customer_id', $customer->id);
          } catch (Exception $e) {
        $result = array(
          'success' => FALSE,
          'comment' => $e->getCode(),
          'message' => t("Stripe Customer Creation Failed for order !order: !message", array(
            "!order" => $order->id(),
            "!message" => $e->getMessage()
          )),
          'uid' => $user->id(),
          'order_id' => $order->id(),
        );

        uc_order_comment_save($order->id(), $user->id(), $result['message']);

        \Drupal::logger('uc_stripe')
          ->notice('Failed stripe customer creation: @message', array('@message' => $result['message']));
        $message = $this->t('Credit card charge failed.');
        uc_order_comment_save($order->id(), $user->id(), $message, 'admin');
        return $result;
      }
      if ($amount == 0) {
        $result = array(
          'success' => TRUE,
          'message' => t('Payment of 0 approved'),
          'uid' => $user->uid,
          'trans_id' => md5(uniqid(rand())),
        );
        uc_order_comment_save($order->id(), $user->id(), $result['message'], 'admin');
        return $result;
      }

      try {
        // charge the Customer the amount in the order
        $currency = \Drupal::config('uc_store.settings')->get('currency')['code'];
        $charge = \Stripe\Charge::create(array(
            "amount" => $amount,
            "currency" => strtolower($currency),
            //"source" => $stripe_token_val,
            "customer" => $customer->id,
            "description" => t("Order #@order_id", array("@order_id" => $order->id())),
          )
        );
        $formatted_amount = $amount / 100;
        $formatted_amount = number_format($formatted_amount, 2);

        $message = $this->t('Credit card charged: @amount', ['@amount' => $formatted_amount]);
        uc_order_comment_save($order->id(), $user->id(), $message, 'admin');
       $result = array(
          'success' => TRUE,  
          'comment' => $this->t('Card charged, resolution code: 0022548315'),
          'message' => $this->t('Credit card payment processed successfully.'),
          'uid' => $user->id(),
        );
       $comment =$result['comment'];

    $session = \Drupal::service('session');
    $session->remove('uc_checkout_review_' . $order->id());
    $session->set('uc_checkout_complete_' . $order->id(), TRUE);
    $session->set('cart_order', $order->id());

      $plugin1 =$plugin->get('plugin');
 if ($result['success'] == TRUE) {
      uc_payment_enter($path_argument[2], $plugin1, $amount, $user->id(), $data, $comment , $received = NULL);
     $table = 'uc_orders ';
    $database=\Drupal::database()->update($table)
      ->fields(array('payment_method' => $mid))
      ->condition('order_id', $path_argument[2])
      ->condition('order_status', 'completed')
      ->execute();
//$paymentmethod =$order->get('payment_method')->value ;
//if($paymentmethod == $mid)
    $recipient = $form_state->getValue('email');
    $params = ['order' => $order];
    $this->mailManager->mail('uc_order', 'invoice', $recipient, uc_store_mail_recipient_langcode($recipient), $params, uc_store_email_from());
     $message = $this->t('Invoice e-mailed to @email.', ['@email' => $recipient]);
    $this->messenger()->addMessage($message);
  //}
}
    $form_state->setRedirect('uc_cart.checkout_complete');

  return;

      } catch (Exception $e) {
        $result = array(
          'success' => FALSE,
          'comment' => $e->getCode(),
          'message' => t("Stripe Charge Failed for order !order: !message", array(
            "!order" => $order->id(),
            "!message" => $e->getMessage()
          )),
          'uid' => $user->uid,
          'order_id' => $order->id(),
        );
        uc_order_comment_save($order->id(), $user->uid, $result['message'], 'admin');
        watchdog('uc_stripe', 'Stripe charge failed for order @order, message: @message', array('@order' => $order->id(), '@message' => $result['message']));

        return $result;
      }

      //  Default / Fallback procedure to fail if the above conditions aren't met

      $result = array(
        'success' => FALSE,
        'comment' => "Stripe Gateway Error",
        'message' => "Stripe Gateway Error",
        'uid' => $user->uid,
        'order_id' => $order->id(),
      );

      uc_order_comment_save($order->id(), $user->uid, $result['message'], 'admin');

      watchdog('uc_stripe', 'Stripe gateway error for order @order_id', array('order_id' => $order->id()));

      return $result;
     }
   }
  }

  /**
   * Utility function: Load stripe API
   *
   * @return bool
   */
  public function prepareApi() {
  $current_path = \Drupal::service('path.current')->getPath();
  $path_argument = explode('/', $current_path);
  $order = Order::load($path_argument[2]);
  $path_args = $_GET;
  $mid = $path_args['mid'];
  $plugin = PaymentMethod::load($mid);
  $configuration = $plugin->get('settings');
    // Not clear that this is useful since payment config form forces at least some config
    if (!_uc_stripe_check_api_keys($configuration)) {
      \Drupal::logger('uc_stripe')->error('Stripe API keys are not configured. Payments cannot be made without them.', array());
      return FALSE;
    }

    $secret_key = $configuration['testmode'] ? $configuration['test_secret_key'] : $configuration['live_secret_key'];
   // dsm($secret_key);
    try {
      \Stripe\Stripe::setApiKey($secret_key);
    } catch (Exception $e) {
      \Drupal::logger('uc_stripe')->notice('Error setting the Stripe API Key. Payments will not be processed: %error', array('%error' => $e->getMessage()));
    }
    return TRUE;
  }

    function getStripeCustomerID($uid) {

    /** @var \Drupal\user\UserDataInterface $userdata_container */
    $userdata_container = \Drupal::getContainer('user.data');

    $id = $userdata_container->get('uc_stripe', $uid, 'uc_stripe_customer_id');
    return $id;
  }


}