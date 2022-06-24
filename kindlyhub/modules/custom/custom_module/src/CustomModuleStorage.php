<?php

namespace Drupal\custom_module;

use Drupal\Core\Database\Connection;
use Drupal\Core\Database\Query\Condition;

/**
 * Defines the protected page storage service.
 */
class CustomModuleStorage {

  /**
   * The database connection to use.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * Constructs a new protected page storage service.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection to use.
   */
  public function __construct( $connection)
  {
    $this->connection = $connection;
  }

 /**
  * @param $region_id
  *   A contain nid of region
  * @param $agency_id
  *   A contain nid of agency.
  *
  * @return object
  *   An object containing the loaded entries if found.
  *
  * @see Drupal\Core\Database\Connection::select()
  */
  public function loadLocation($region_id, $agency_id) {
    $select = $this->connection;
    $query = $select->select('node_field_data', 'nfd')
      ->fields('nfd', ['title', 'nid']);
    $query->leftJoin('node__field_regional_reference', 'reference',
        'nfd.nid=reference.entity_id AND
        (reference.deleted = :param1 AND reference.langcode = nfd.langcode)',
        [':param1' => '0']);
    $query->leftJoin('node__field_agency', 'agency',
        "nfd.nid = agency.entity_id AND
        (agency.deleted = :param1 AND (agency.langcode = nfd.langcode OR agency.bundle = :param2))",
        [':param1' => '0', ':param2'=>'agency']);
    $query->condition('nfd.status', '1')
      ->condition('nfd.type', 'location')
      -> condition('reference.field_regional_reference_target_id', $region_id=406)
      -> condition('agency.field_agency_target_id', $agency_id=212);
    $query->orderBy('nfd.title', 'ASC');
    // Return the result in object format.
    return $query->execute()->fetchAll();
  }

  /**
   * @param $agency_id
   * @return int
   */
  public function getAgencyTotalAnnualGoal_OLD($agency_id){
    $select = $this->connection;
    $query = $select->select('node_field_data', 'nfd');
    $query->leftJoin('node__field_agency', 'nfa', 'nfd.nid = nfa.entity_id AND
    nfa.deleted = :param1 AND (nfa.langcode = nfd.langcode OR nfa.bundle = :param2)',
      [':param1' => '0', ':param2' => 'classroom'] );
    $query->leftJoin('node__field_average_hours_expected', 'annual_goal', 'nfd.nid = annual_goal.entity_id');
    $query->condition('nfd.status', '1')
      ->condition('nfd.type', 'location')
      -> condition('nfa.field_agency_target_id', $agency_id);
    $query->addExpression('SUM(field_average_hours_expected_value)', 'total');

    $result = $query->execute()->fetchCol();
    // Return the result in object format.
    if (!empty($result[0])) {
      return $result[0];
    } else return 0;
  }


  /**
   * @param $agency_id
   * @return int
   */
  public function getAgencyTotalAnnualGoal($agency_id){
    $select = $this->connection;
    $query = $select->select('node__field_fun', 'fun')
    ->fields('fun', ['field_fun_target_id'])
    ->fields('goal', ['field_current_year_hourly_goal_value'])
    ->fields('obligation', ['field_current_year_monetary_amt_value'])
    ->fields('budget', ['field_agency_budget_value'])
    ->fields('hour', ['field_average_hour_week_value'])
    ->fields('std', ['field_total_student_value']);

    $query->leftJoin('node__field_current_year_hourly_goal', 'goal', 'fun.field_fun_target_id = goal.entity_id' );

    $query->leftJoin('node__field_current_year_monetary_amt', 'obligation', 'fun.field_fun_target_id = obligation.entity_id' );



    $query->leftJoin('node__field_agency_budget', 'budget', 'fun.field_fun_target_id = budget.entity_id') ;

    $query->leftJoin('node__field_average_hour_week', 'hour', 'fun.field_fun_target_id = hour.entity_id') ;

    $query->leftJoin('node__field_total_student', 'std', 'fun.field_fun_target_id = std.entity_id') ;



    $query->condition('fun.deleted', '0')
      ->condition('fun.bundle', 'agency')
      -> condition('fun.entity_id', $agency_id);
    //$query->addExpression('SUM(field_average_hours_expected_value)', 'total');

    $result = $query->execute()->fetchAll();
    // Return the result in object format.
    return $result;
  }



  /**
   * @param $id
   * @param $type
   * @return int
   */
  public function getAgencyTotalStudent($id, $type)
  {
    $select = $this->connection;
    $query = $select->select('node_field_data', 'nfd');

    if($type == 'agency') {
      $query->leftJoin('node__field_agency', 'nfa', 'nfd.nid = nfa.entity_id AND
    nfa.deleted = :param1 AND (nfa.langcode = nfd.langcode OR nfa.bundle = :param2)',
        [':param1' => '0', ':param2' => 'student']);
      $query->condition('nfa.field_agency_target_id', $id);

    }elseif ($type == 'location') {
      $query->leftJoin('node__field_location_reference', 'nflr', 'nfd.nid = nflr.entity_id AND
    nflr.deleted = :param1 AND (nflr.langcode = nfd.langcode OR nflr.bundle = :param2)',
        [':param1' => '0', ':param2' => 'student']);
      $query->condition('nflr.field_location_reference_target_id', $id);

    }elseif($type == 'funding_source') {
       $query->leftJoin('node__field_funded_by', 'nffy', 'nfd.nid = nffy.entity_id AND
    nffy.deleted = :param1 AND (nffy.langcode = nfd.langcode OR nffy.bundle = :param2)',
        [':param1' => '0', ':param2' => 'student']);
      $query->condition('nffy.field_funded_by_target_id', $id);
    }

    $query->condition('nfd.status', '1')
      ->condition('nfd.type', 'student');

    $query->addExpression('COUNT(nfd.nid)', 'total');

    $result = $query->execute()->fetchCol();
    // Return the result in object format.
    if (!empty($result[0])) {
      return $result[0];
    } else return 0;
  }


  /**
   * @param $date_start
   * @param $date_end
   * @return false|float
   */
  function getSchoolTotalWeeks($date_start, $date_end)
  {
    $date_start = strtotime($date_start);
    $date_end = strtotime($date_end);

    $difference        = $date_end - $date_start; // Difference in seconds
    $days  = floor($difference / 86400);
    $weeks = floor($days / 7);
    return $weeks;
  }

}
