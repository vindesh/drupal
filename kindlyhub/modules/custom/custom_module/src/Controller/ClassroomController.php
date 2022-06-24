<?php
/**
 * @file
 * Contains \Drupal\custom_module\Controller\ClassroomController.
 */
namespace Drupal\custom_module\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\user\Entity\User;
use Drupal\node\Entity\Node;
use Drupal\file\Entity\File;
use Drupal\file\Entity;
use Drupal\Core\Entity\EntityInterface;
use \Drupal\Core\Routing;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Drupal\field\Entity\FieldConfig;
use Drupal\Core\StreamWrapper\PrivateStream;
use Drupal\Core\StreamWrapper\PublicStream;

class ClassroomController extends ControllerBase{		
	public function postalreturn(Request $request) {
  	$line_item_id  = $_REQUEST['value1'];
  	$order = $_REQUEST['value2'];
  	$nid = $_REQUEST['value3'];
      $unset = ['target_id' =>$order];
      $finalRes =uc_order_delete_line_item($line_item_id);
  	$node1 = Node::load($nid);
  	$val =$node1->get('field_order_id_applied_coupon_')->getvalue();
      $usage =$node1->get('field_usage')->value;
      $us_cal = $usage-1;
      $node1->field_usage= $us_cal;
      $key = array_search($unset, $val);
      $node1->get('field_order_id_applied_coupon_')->removeItem($key);
      $node1->save();

    $reaponse =  new JsonResponse( $finalRes );
        return $reaponse;

	}

/**
 *  If user attach with Community Partner then....
 *  return Community Partner hourly rate if rate not exist then
 *  get Agency rate.
 *  @vm0209
 **/
public function communityPartnerRate(Request $request){
  $param  = $_REQUEST['value1'];
  if($param) {
    $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $cp_rate = $user->field_community_partner_rate->getValue();
    $cp_rate = (count($cp_rate) > 0)?$cp_rate[0]['value']:FALSE;
    //if($cp_rate && $cp_rate > 0){
    if(FALSE){
      $rate = $cp_rate;
    }else{
      $agency = $user->get('field_agency_reference')->getValue();
      $agencyid = (count($agency) > 0 ? $agency[0]['target_id'] : FALSE);
      if($agencyid){
        $agencyi_load = node_load($agencyid);
        $rate = $agencyi_load->get('field_hourly_rate_i_e_16_95')->getValue()[0]['value'];
      }
    }
    if(!empty($rate)){
      $reaponse =  new JsonResponse($rate);
      return $reaponse;
    }
  }
  $reaponse =  new JsonResponse(0);
  return $reaponse;
}

public function texoreturn(Request $request) {
    $texonomy  = $_REQUEST['value1'];
    if($texonomy == '_none'){
    $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
    $cmr = $user->get('field_community_partner_rate')->getvalue();
    $hourlyrate = $cmr[0]['value'];
    if(isset($hourlyrate) && !empty($hourlyrate)){
    $reaponse =  new JsonResponse($hourlyrate);
    return $reaponse;
    }else{
    $agency = $user->get('field_agency_reference')->getValue();
    $agencyid = $agency[0]['target_id'];
    $agencyi_load = node_load($agencyid);
    $value1= $agencyi_load->get('field_hourly_rate_i_e_16_95')->getValue()[0]['value'];
    $reaponse =  new JsonResponse($value1);
    return $reaponse;
     }
    }else{
     $term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($texonomy);
     $value = $term->field_hourly_rate->value;
     $reaponse =  new JsonResponse( $value );
      return $reaponse;
       }
     }


  public function getclassrooms(Request $request) {
      $location  = $_REQUEST['value1'];
      $classroom = [];
$csvData = json_decode(drupal_render(views_embed_view('all_activities', 'data_export_1', $location)));
  foreach ($csvData as $key => $csvDataRow) {
              $fieldArray = (array)$csvDataRow;
              $nid = $fieldArray['nid'];
              $key = $fieldArray['title'];
              $fieldval1 =html_entity_decode($key, ENT_QUOTES);
              $classroom[] =array('nid' =>  $nid, 'name' => $key);
          }
  $finalRes = array('opt' => $classroom);
  $reaponse =  new JsonResponse($finalRes);
      
      return $reaponse;
       }

public function custom_export(){
$csvData = json_decode(drupal_render(views_embed_view('classroom_users', 'data_export_1')));
$csvData = str_replace(",", " ", $csvData);
$definitions = \Drupal::service('entity_field.manager')->getFieldDefinitions('node', 'page');

$definitions = \Drupal::service('entity_field.manager')->getFieldDefinitions('node', 'in_kind_donation');
foreach (array_keys($definitions) as $key) {
  // get label for field machine name $key:
  $label[$key] = $definitions[$key]->getLabel();
}
$private_path = PrivateStream::basepath();
$public_path = PublicStream::basepath();
$fieldLabelArray = [];
$minutesTotal = 0;
$file_base = ($private_path) ? $private_path : $public_path;
$filename = 'All-in-kind-donation-report'. time(). '.csv';
$filepath = $file_base . '/' . $filename;           
$csvFile = fopen($filepath, "w");
foreach($csvData as $key => $csvDataRow){
$fieldArray = (array)$csvDataRow;
$fieldValue = implode(',', str_replace(",", " ", $fieldArray));
$fieldval2 =strip_tags(html_entity_decode($fieldValue, ENT_QUOTES));
$fieldval1 = str_replace("\n","",$fieldval2);

$minutesTotal += $fieldArray['field_minutes'];
$millage += $fieldArray['field_doctor_visit_mileage'];
$body = $fieldArray['body'];
$df = str_replace("\r\n","",$body);
$user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
$agency = $user->get('field_agency_reference')->getValue();
$agencyid = $agency[0]['target_id'];
$agency_node = node_load($agencyid);
if(isset($agency_node)){
$total_miles = $agency_node->get('field_mileage_reimbursement')->getValue()[0]['value'];
$total_hour = $agency_node->get('field_total_number_of_hours_requ')->getvalue();
$hour_required= $total_hour[0]['value'];
$dontion_rate= $agency_node->get('field_hourly_rate_i_e_16_95')->getvalue();
$donation = $dontion_rate[0]['value'];
$total_hour_minute = $hour_required *60;
}
if($key == 0){
    $fieldArrayKey = array_keys($fieldArray);
   // print_r($fieldArrayKey); 

foreach ($fieldArrayKey as $value) {
//$field_label = $value->getFieldDefinition()->getLabel();
if($value != 'field_funded_by' && $value != 'created_1' && $value != 'body'&& $value !='nothing'  && $value != 'field_readiness_goals'&& $value !='nothing_1' ){
$fieldLabelArray[] = $label[$value];
// print_r($definitions[$value]); 
}
 if($value == 'field_funded_by'){
  $fieldLabelArray[] = 'Grant Number';
 }

  if($value == 'created_1'){
  $fieldLabelArray[] = 'Submission Month';
 }
   if($value == 'body'){
  $fieldLabelArray[] = 'Notes';
 }

 if($value == 'nothing'){
   $fieldLabelArray[] = 'Donation Status';
 }
if($value == 'field_readiness_goals'){
  $fieldLabelArray[] = 'Readiness Goals';
 }
if($value == 'nothing_1'){
  $fieldLabelArray[] = 'Electronic Signature';
 }

 }
$fieldNames = implode(',',$fieldLabelArray);
fwrite($csvFile,$fieldNames . "\n");
//fwrite($csvFile,$fieldValue . "\n");
}
fwrite($csvFile,$fieldval1 . "\n");
}
$total_percent = number_format($minutesTotal/$total_hour_minute*100 , 3);
$per=' %  ';
$minutesTotalArray = implode(',', array(' ',' ',' ',' ',' ','','Total Percent',$total_percent . $per,' ',' ',' '));
$minutetohour = $minutesTotal/60;

$minute =number_format($minutetohour);
$grand_total =$minute*$donation;
$total =number_format($grand_total,3);
$total = str_replace(",", "", $total);
$total_milage_rem = $total_miles*$millage;
$total_hourly_rate_hour = $donation*$minute;
$overall = $total_milage_rem+$total_hourly_rate_hour;
//print_r($total); die;
$minutesTohourArray = implode(',', array(' ',' ',' ',' ',' ','','Total Hour',$minute,'Total Mileage',number_format($millage),' ',' ',' '));
$donation1 = implode(',', array(' ',' ',' ',' ',' ','','TOTAL DOLLAR VALUE OF THE In-KIND DONATION','$'.number_format($total_hourly_rate_hour),' ',' ',' '));
$total_mil = implode(',', array(' ',' ',' ',' ',' ',' ','TOTAL DOLLAR VALUE of the MILEAGE ', '$'.number_format($total_milage_rem),' ',' ',' '));
$donation12 = implode(',', array(' ',' ',' ',' ',' ','','Grand Total','$'.number_format($overall),' ',' ',' '));

fwrite($csvFile,$minutesTotalArray . "\n"); 
fwrite($csvFile,$minutesTohourArray . "\n");
fwrite($csvFile,$total_mil . "\n");
fwrite($csvFile,$donation1 . "\n");
fwrite($csvFile,$donation12 . "\n"); 

       


fclose($csvFile);       
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="'. basename($filepath) . '";');
header('Content-Length: ' . filesize($filepath));
readfile($filepath);
unlink($filepath);  
exit;       
  }
}
