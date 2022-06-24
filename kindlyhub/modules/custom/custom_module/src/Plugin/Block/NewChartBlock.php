<?php

/**
 * @file
 * Contains \Drupal\custom_module\Plugin\Block\NewChartBlock.
 */

namespace Drupal\custom_module\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormInterface;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\block\Entity\Block;
use Drupal\node\Entity\Node;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Component\Utility\Html;
use \Drupal\Core\Routing;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;


/**
 * Provides a 'Custom Site Content' block.
 *
 * @Block(
 *   id = "NewChartBlock",
 *   admin_label = @Translation("custom NewChar  Block"),
 *   category = @Translation("Custom")
 * )
 */
class NewChartBlock extends BlockBase
{
  /**
   * {@inheritdoc}
   */

  public function build()
  {
    $userCurrent = \Drupal::currentUser();
    $user = \Drupal\user\Entity\User::load($userCurrent->id());
    $uid = $user->get('uid')->value;
    $agencyid = $user->get('field_agency_reference')->getValue()[0]['target_id'];
    $agency_node = node_load($agencyid);
    //kint($agency_node);

    if (isset($agency_node)) {

      $currentYear = $agency_node->get('field_date')->getValue();
      $yearStartDate = strtotime($currentYear[0]['value']);
      $yearEndDate = strtotime($currentYear[0]['end_value']);

      $total_miles = $agency_node->get('field_mileage_reimbursement')->getValue()[0]['value'];
      $total_hour = $agency_node->get('field_total_number_of_hours_requ')->getvalue();
      $hour_required = $total_hour[0]['value'];
      $dontion_rate = $agency_node->get('field_hourly_rate_i_e_16_95')->getvalue();
      $agecnyObligation = (int)$agency_node->get('field_agency_obligation')->getvalue()[0]['value'];
      //kint($agecnyObligation);
      //die();
      $donation = $dontion_rate[0]['value'];
      $total_hour_minute = $hour_required * 60;

      $strQ = "SELECT node__field_agency.field_agency_target_id AS node__field_agency_field_agency_target_id, node_field_data_node__field_agency__node__field_mileage_reimbursement.field_mileage_reimbursement_value AS node_field_data_node__field_agency__node__field_mileage_reim, node_field_data_node__field_agency__node__field_total_number_of_hours_requ.field_total_number_of_hours_requ_value AS node_field_data_node__field_agency__node__field_total_number, node_field_data_node__field_agency__node__field_agency_obligation.field_agency_obligation_value AS node_field_data_node__field_agency__node__field_agency_oblig, COUNT(node_field_data.title) AS node_field_data_title, SUM(node__field_in_kind_donation_value.field_in_kind_donation_value_value) AS node__field_in_kind_donation_value_field_in_kind_donation_va, SUM(node__field_in_kind_donation_value.delta) AS node__field_in_kind_donation_value_delta, SUM(node__field_in_kind_donation_value.langcode) AS node__field_in_kind_donation_value_langcode, SUM(node__field_in_kind_donation_value.bundle) AS node__field_in_kind_donation_value_bundle, SUM(node__field_doctor_visit_mileage.field_doctor_visit_mileage_value) AS node__field_doctor_visit_mileage_field_doctor_visit_mileage_, SUM(node__field_doctor_visit_mileage.delta) AS node__field_doctor_visit_mileage_delta, SUM(node__field_doctor_visit_mileage.langcode) AS node__field_doctor_visit_mileage_langcode, SUM(node__field_doctor_visit_mileage.bundle) AS node__field_doctor_visit_mileage_bundle, SUM(node__field_minutes.field_minutes_value) AS node__field_minutes_field_minutes_value, SUM(node__field_minutes.delta) AS node__field_minutes_delta, SUM(node__field_minutes.langcode) AS node__field_minutes_langcode, SUM(node__field_minutes.bundle) AS node__field_minutes_bundle, SUM(node__field_donation_amount.field_donation_amount_value) AS node__field_donation_amount_field_donation_amount_value, SUM(node__field_donation_amount.delta) AS node__field_donation_amount_delta, SUM(node__field_donation_amount.langcode) AS node__field_donation_amount_langcode, SUM(node__field_donation_amount.bundle) AS node__field_donation_amount_bundle, MIN(node_field_data.nid) AS nid, MIN(node_field_data_node__field_agency.nid) AS node_field_data_node__field_agency_nid, MIN(flagging_node_field_data.id) AS flagging_node_field_data_id, MIN(flagging_node_field_data_1.id) AS flagging_node_field_data_1_id, MIN(flagging_node_field_data_2.id) AS flagging_node_field_data_2_id
      FROM
      {node_field_data} node_field_data
      LEFT JOIN {node__field_agency} node__field_agency ON node_field_data.nid = node__field_agency.entity_id AND node__field_agency.deleted = '0' AND (node__field_agency.langcode = node_field_data.langcode OR node__field_agency.bundle = 'classroom')
      LEFT JOIN {node_field_data} node_field_data_node__field_agency ON node__field_agency.field_agency_target_id = node_field_data_node__field_agency.nid
      LEFT JOIN {flagging} flagging_node_field_data ON node_field_data.nid = flagging_node_field_data.entity_id AND flagging_node_field_data.flag_id = 'approve'
      LEFT JOIN {flagging} flagging_node_field_data_1 ON node_field_data.nid = flagging_node_field_data_1.entity_id AND flagging_node_field_data_1.flag_id = 'pending'
      LEFT JOIN {flagging} flagging_node_field_data_2 ON node_field_data.nid = flagging_node_field_data_2.entity_id AND flagging_node_field_data_2.flag_id = 'reject'
      LEFT JOIN {node__field_in_kind_donation_value} node__field_in_kind_donation_value ON node_field_data.nid = node__field_in_kind_donation_value.entity_id AND node__field_in_kind_donation_value.deleted = '0'
      LEFT JOIN {node__field_doctor_visit_mileage} node__field_doctor_visit_mileage ON node_field_data.nid = node__field_doctor_visit_mileage.entity_id AND node__field_doctor_visit_mileage.deleted = '0'
      LEFT JOIN {node__field_mileage_reimbursement} node_field_data_node__field_agency__node__field_mileage_reimbursement ON node_field_data_node__field_agency.nid = node_field_data_node__field_agency__node__field_mileage_reimbursement.entity_id AND node_field_data_node__field_agency__node__field_mileage_reimbursement.deleted = '0'
      LEFT JOIN {node__field_minutes} node__field_minutes ON node_field_data.nid = node__field_minutes.entity_id AND node__field_minutes.deleted = '0'
      LEFT JOIN {node__field_donation_amount} node__field_donation_amount ON node_field_data.nid = node__field_donation_amount.entity_id AND node__field_donation_amount.deleted = '0'
      LEFT JOIN {node__field_total_number_of_hours_requ} node_field_data_node__field_agency__node__field_total_number_of_hours_requ ON node_field_data_node__field_agency.nid = node_field_data_node__field_agency__node__field_total_number_of_hours_requ.entity_id AND node_field_data_node__field_agency__node__field_total_number_of_hours_requ.deleted = '0'
      LEFT JOIN {node__field_agency_obligation} node_field_data_node__field_agency__node__field_agency_obligation ON node_field_data_node__field_agency.nid = node_field_data_node__field_agency__node__field_agency_obligation.entity_id AND node_field_data_node__field_agency__node__field_agency_obligation.deleted = '0'
      WHERE ((node__field_agency.field_agency_target_id = '" . $agencyid . "')) AND ((node_field_data.status = '1') AND (node_field_data.type IN ('in_kind_donation')) AND ((node_field_data.created  BETWEEN " . $yearStartDate . " AND " . $yearEndDate . ")) AND (flagging_node_field_data.flag_id IN ('approve')))
      GROUP BY node__field_agency_field_agency_target_id, node_field_data_node__field_agency__node__field_mileage_reim, node_field_data_node__field_agency__node__field_total_number, node_field_data_node__field_agency__node__field_agency_oblig";
            //kint($strQ);
      $qObj = db_query($strQ)->FetchAll();
      if (count($qObj) > 0) {
        //kint($qObj);
  
        $minute = ($qObj[0]->node__field_minutes_field_minutes_value );
        $hours = round($minute / 60, 2);
        $millage = round($qObj[0]->node__field_doctor_visit_mileage_field_doctor_visit_mileage_, 2);
        $goodser = round($qObj[0]->node__field_in_kind_donation_value_field_in_kind_donation_va, 2);
        $total =  round($qObj[0]->node__field_donation_amount_field_donation_amount_value, 2);
        
        $millageInDollor =  round($millage * $total_miles, 2) ;
        $grandTotal = ($total + $goodser + $millageInDollor);
        if($agecnyObligation)
        {
          $total_percent = round(($grandTotal/$agecnyObligation)*100, 2) ."%";
        }
        else
        {
          $total_percent = "<span style='font-size:50px'>Set agency goal</span>";
        }
        
        $form['text']['#markup'] = t('<a href="report.pdf"  id="printButton" style="float: right;" onClick="window.print(); return false">Print</a><br>
        <div id="dash-report-numbers">
        <table style="width: 100%;">
        <tr>
            <td style="width: 33.333333%;">
                <div class="reports-num">
                    <h2>$' . $total . '</h2>
                    <p>( ' . $hours . ' Hours )</p>
                  </div>
            </td>
            <td style="width: 33.333333%;">
                <div class="reports-num">
                    <h2>$' .$millageInDollor. ' </h2>
                    <p> ( ' . ($millage) . ' Miles x ' . $total_miles . ' Rate ) </p>
                  </div>
            </td>
            <td style="width: 33.333333%;">
                <div class="reports-num">
                    <h2>$' . ($goodser) . '</h2>
                    <p>( Goods & Services ) </p>
                  </div>
            </td>
        </tr>
    </table>
    <table style="width: 100%;margin-top: 30px;">
        <tr>
            <td style="width: 50%;">
                <div id="dash-report-number-bottom" >
                <div >
                  <h2> $' . ($total + $goodser + $millageInDollor) . '</h2>
                  <div class="dash-report-num-center" style="display: table;"><img src="/sites/default/files/2021-01/Kindly-Logo-3-150x150.png">
                  <p>Total to Date</p></div>
                </div>
            </td>
            <td style="width: 50%;">
            <div id="dash-report-number-bottom">
                <div style="border-left: 2px solid #0048CD;">
                    <h2>' . ($total_percent) . '</h2>
                    <div class="dash-report-num-center" style="display: table;" ><img src="/sites/default/files/2021-01/Kindly-Logo-3-150x150.png">
                    <p>Percent to Goal</p></div>
                  </div>
                </div>
            </td>
        </tr>
    </table>
    </div>
       
          ');
        //$form['form'][] = views_embed_view('classroom_users', 'page_5',  $uid);
        $form['form'][] = views_embed_view('chart_monthly_bar', 'approved_chart',  $uid);
        $form['form'][] = views_embed_view('chart_monthly_bar_by_location', 'approved_chart',  $uid);
      }
      else
      {
        $form['text']['#markup'] = t('<div id="dash-report-numbers" class="container-fluid">
            <div class="container-fluid">
            <h3 style=" text-align: center; height: 300px; "> No Records Found </h3>
            </div>
            </div>
            ');
      }
    }
    return $form;
  }
}
