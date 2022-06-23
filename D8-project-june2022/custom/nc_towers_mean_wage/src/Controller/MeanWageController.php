<?php
namespace Drupal\nc_towers_mean_wage\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class MeanWageController extends ControllerBase {

  public function SchoolType(Request $request){
    $data = [];

    $database = \Drupal::database();
    $query = $database->select('taxonomy_term_field_data', 'td');
    $query->fields('td', ['name']);
    $query->condition('td.vid', 'agency', '=');
    $schoolTypes = $query->distinct()->execute()->fetchAll();
    foreach ($schoolTypes as $id => $schoolType) {
      $data[] = $schoolType->name;
    }
    return new JsonResponse($data);
  }

  public function School(Request $request){
    $title = $request->get("searchTerm");
    $data = [];

    $database = \Drupal::database();
    $query = $database->select('taxonomy_term_field_data', 'td');
    $query->join('node__field_agency', 'na', 'td.tid = na.field_agency_target_id');
    $query->join('node__field_campus', 'nc', 'na.entity_id = nc.entity_id');
    $query->condition('td.name', $title);
    $query->condition('na.bundle','main_outcomes')
    ->fields('nc', ['field_campus_target_id']);
    $schools = $query->distinct()->execute()->fetchAll();
    foreach ($schools as $id => $school) {
      $termData = self::getTermData($database, $school->field_campus_target_id);
      $data[] = $termData->name;
    }
    return new  JsonResponse($data);
  }

  public function ProgramStudy(Request $request){
    $title = $request->get("searchTerm");
    $data = [];

    $database = \Drupal::database();
    $query = $database->select('taxonomy_term_field_data', 'td');
    $query->join('node__field_campus', 'nca', 'td.tid = nca.field_campus_target_id');
    $query->join('node__field_program', 'np', 'nca.entity_id = np.entity_id');
    $query->condition('td.name', $title);
    $query->condition('nca.bundle','main_outcomes')

    ->fields('np', ['field_program_target_id']);
    $programStudies = $query->distinct()->execute()->fetchAll();
    foreach ($programStudies as $id => $programStudy) {
      $termData = self::getTermData($database, $programStudy->field_program_target_id);
      $data[] = $termData->name;
    }
    return new  JsonResponse($data);
  }

  public function Degree(Request $request){
    $title = $request->get("searchTerm");
    $school_name = $request->get("school");
    $data = [];

    $database = \Drupal::database();
    $query = $database->select('taxonomy_term_field_data', 'td');
    $query->join('node__field_campus', 'nca', 'td.tid = nca.field_campus_target_id');
    $query->join('node__field_program', 'np', 'nca.entity_id = np.entity_id');
    $query->join('node__field_credential', 'ncr', 'np.entity_id = ncr.entity_id');
    $query->join('taxonomy_term_field_data', 'tdp', 'tdp.tid = np.field_program_target_id');
    $query->condition('td.name', $school_name);
    $query->condition('tdp.name', $title);
    $query->condition('np.bundle','main_outcomes')
    ->fields('ncr', ['field_credential_target_id']);

    $degrees = $query->distinct()->execute()->fetchAll();
    foreach ($degrees as $id => $degree) {
      $termData = self::getTermData($database, $degree->field_credential_target_id);
      $data[] = $termData->name;
    }
    return new  JsonResponse($data);
  }

  public function SchoolYear(Request $request){
    $data = [];

    $database = \Drupal::database();
    $query = $database->select('taxonomy_term_field_data', 'td');
    $query->fields('td', ['name']);
    $query->condition('td.vid', 'school_year', '=');
    $schoolYears = $query->execute()->fetchAll();
    foreach ($schoolYears as $id => $schoolYear) {
      $data[] = $schoolYear->name;
    }

    sort($data);
    return new  JsonResponse($data);
  }

  public function getTermData($database, $tid) {
    $query = $database->select('taxonomy_term_field_data', 'td');
    $query->condition('td.tid', $tid)
    ->fields('td',['name', 'tid']);
    return $query->distinct()->execute()->fetchObject();
  }

}
