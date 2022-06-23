<?php
namespace Drupal\nc_towers_report_builder\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\node\Entity\NodeType;
use Symfony\Component\HttpFoundation\Response;
use Drupal\nc_towers_report_builder\Controller\Helper;

class ReportBuilderController extends ControllerBase {

  public function download(Request $request){
    $helperObj = new Helper();
    $termFields = $helperObj->termFields;
    $nodeFields = $helperObj->nodeFields;
    $typeOptions = $termFieldsData = [];
    $database = \Drupal::database();
    foreach ($nodeFields as $name => $data) {
      $typeOptions[$name] = $data['name'];
      foreach ($data['fields'] as $id => $field) {
        $vid = '';
        if($id == 'field_agency'){
          $vid = 'agency';
        }elseif($id == 'field_campus'){
          $vid = 'campus';
        }elseif($id == 'field_program'){
          $vid = 'program';
        }elseif($id == 'field_school_year'){
          $vid = 'school_year';
        }elseif($id == 'field_credential'){
          $vid = 'credential';
        }elseif($id == 'field_gender'){
          $vid = 'gender';
        }elseif($id == 'field_race'){
          $vid = 'race';
        }elseif($id == 'field_enrollment_type'){
          $vid = 'enrollment_type';
        }elseif($id == 'field_employment_sector'){
          $vid = 'employment_sector';
        }

        if(!empty($vid)){
          $termFieldsData[$id] = $helperObj->getTermData($database, $vid, '', true);
        }
      }
    }

    $current_path = \Drupal::request()->query->all(); 
    $type = '';
    if(isset($current_path['node_type']) && !empty($current_path['node_type'])){
      $type = $current_path['node_type'];
    }
    $fieldsArr = [];
    $exculde_node_fields = ['field_sequences'];
    if(!empty($type)){
      $fieldsArr = $nodeFields[$type]['fields'];
    }

    $defaultFieldsArr = $defaultFields = $tableHeader = [];
    if(isset($current_path['fields']) && !empty($current_path['fields'])){
      
      $defaultFieldsArr = unserialize($current_path['fields']);
      $defaultFields = array_column($defaultFieldsArr, 'machine_name');

      foreach ($defaultFieldsArr as $fid => $headerFields) {
        $tableHeader[$fid] = '"'.$headerFields['field'].'"';
        if(!empty($headerFields['display_name'])){
          $tableHeader[$fid] = '"'.$headerFields['display_name'].'"';
        }
      }
    }
    $defaultFiltersArr = [];
    if(isset($current_path['filters']) && !empty($current_path['filters'])){
      $defaultFiltersArr = unserialize($current_path['filters']);
    }
    $csv_rows = [];
    $csv_rows[0] = implode(',', $tableHeader);
        
    $outputData = $helperObj->getTableData($database,$fieldsArr,$defaultFieldsArr,$defaultFiltersArr,$type,$termFields,''); 
    if(!empty($outputData)) {
      foreach ($outputData as $key => $nodeArr) {
        $items = [];
        foreach ($defaultFields as $id => $name) {
          if(isset($nodeArr->$name)){
            $item = $nodeArr->$name;
            if(in_array($name, $termFields)){
              if(isset($termFieldsData[$name][$item])){
                $item = '"'.$termFieldsData[$name][$item].'"';
              }
            }

            if($item == '-1') {
              $item = t('Data Suppressed');
            }
            $items[] = $item;
          }
        }
        $csv_rows[] = implode(',', $items);
      } 
    }
   $csv_content = implode("\n", $csv_rows);
   $response = new Response($csv_content);
   $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
   $response->headers->set('Content-Disposition', 'attachment; filename="NCTower_Report.csv"');

   return $response;
  }
}