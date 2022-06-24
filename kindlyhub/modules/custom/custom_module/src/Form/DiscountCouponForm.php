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
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use \Symfony\Component\HttpFoundation\Cookie;
use Drupal\user\Entity\User;
use Drupal\Core\Messenger\Messenger;




/**
 * 
 */
class DiscountCouponForm extends FormBase
{
	
public function getFormId() {
  return 'discount_coupon_form';
  }

/**
* {@inheritdoc}
*/
public function buildForm(array $form, FormStateInterface $form_state) {

    $form['coupon_val'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Enter Coupon Code'),
      '#prefix' => '<div class="disform-div">',
      
    );
    $form['actions']['#type'] = 'actions';
    $form['actions']['submit'] = array(
      '#type' => 'submit',
      '#prefix' => '<div class="dis-btn">',
      '#suffix' => '</div></div>',
      '#value' => $this->t('Apply'),
      '#button_type' => 'primary',
    );
   return $form;

}
 
public function submitForm(array &$form, FormStateInterface $form_state) {
 $user = User::load(\Drupal::currentUser()->id());
 $coupon = $form_state->getValue('coupon_val');
 $node = db_select('node_field_data', 'i') 
       ->fields('i',['nid'])
      ->condition('i.title', $coupon,'=')
       ->execute()
       ->fetchField();
if(isset($node)){
$node_load = node_load($node);
$title = $node_load->get('field_coupon_title')->value;
$field_discount_type = $node_load->get('field_discount_type')->value;
$field_percentage = $node_load->get('field_percentage')->value;
$field_usage_limit = $node_load->get('field_usage_limit')->value;
$usage = $node_load->get('field_usage')->value;
$user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
$query =\Drupal::database()->select('uc_orders', 'uco');
$query->addField('uco', 'order_total');
$query->join('uc_order_products', 'ucop', 'uco.order_id= ucop.order_id');
$query->condition('uco.order_status', 'in_checkout');
$query->condition('uco.uid',$user->id(),  '=');
$result = $query->execute()->fetchField();
$percent =($field_percentage / 100) * $result;
$order_id = db_select('uc_orders', 'uo') 
       ->fields('uo',['order_id'])->condition('uo.uid', $user->id(),'=')->condition('uo.order_status', 'in_checkout','=')
       ->execute()
       ->fetchField();
$count =$usage+1;  
$node1 = Node::load($node);
$node1->field_usage = $count;
$node1->field_order_id_applied_coupon_[] = $order_id;
$node1->save();
if($count <=  $field_usage_limit ){

$sql_delete= \Drupal::database()->delete('uc_order_line_items')
  ->condition ('order_id',$order_id)
  ->execute();
uc_order_line_item_add($order_id , 'generic', $title, -$percent);

$line_item_id = db_select('uc_order_line_items', 'uo') 
       ->fields('uo',['line_item_id'])->condition('uo.order_id', $order_id,'=')
       ->execute()
       ->fetchField();     

$cook =setcookie("cookieData".$order_id, $line_item_id.'&' .$node);
$cookhu =setcookie("cookieData1", $order_id);
$form_state->setValue('coupon_val', $coupon);
$uri =  \Drupal::request()->getRequestUri();
   $response = new RedirectResponse($uri);
   $form_state->setResponse($response);
    }
     }
 else{
  \Drupal::messenger()->addError('Invalide coupon Code  -'. $coupon);
 }

 
 
}

}