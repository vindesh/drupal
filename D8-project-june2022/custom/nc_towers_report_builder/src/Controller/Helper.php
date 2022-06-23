<?php
namespace Drupal\nc_towers_report_builder\Controller;

class Helper {

  public $excludeTerms = ['All Public Universities', 'All Community Colleges', 'All Subject Areas'];
  public $termFields = ['field_agency', 'field_campus', 'field_program', 'field_school_year', 'field_credential', 'field_gender', 'field_race', 'field_enrollment_type', 'field_employment_sector'];
  public $nodeFields = [
    'students_graduates_counts' => 
      [
      'name' => 'Students & Graduates Counts', 
      'fields' => [
        'field_agency' => 'Agency',
        'field_graduate' => 'Graduates',
        'field_campus' => 'Campus',
        'field_credential' => 'Credential',
        'field_gender' => 'Gender',
        'field_program' => 'Program',
        'field_race' => 'Race',
        'field_school_year' => 'School Year',
        'field_students' => 'Students',
      ]
    ],
    'main_outcomes' => 
      [
      'name' => 'Main Outcomes', 
      'fields' => [
        'field_after_year' => 'After Year',
        'field_agency' => 'Agency',
        'field_campus' => 'Campus',
        'field_credential' => 'Credential',
        'field_employed' => 'Employed',
        'field_enrolled_or_employed' => 'Enrolled or Employed',
        'field_enrollment' => 'Enrollment',
        'field_gender' => 'Gender',
        'field_graduate' => 'Graduates',
        'field_mean_wage' => 'Mean Wage',
        'field_median_wage' => 'Median Wage',
        'field_program' => 'Program',
        'field_race' => 'Race',
        'field_school_year' => 'School Year',
        'field_wage_25' => 'Percentile Wage(25)',
        'field_wage_75' => 'Percentile Wage(75)',
      ]
    ],
    'employment_by_sector' => 
      [
      'name' => 'Employment by Sector', 
      'fields' => [
        'field_after_year' => 'After Year',
        'field_agency' => 'Agency',
        'field_campus' => 'Campus',
        'field_credential' => 'Credential',
        'field_employed' => 'Employed',
        'field_employment_sector' => 'Employment Sector',
        'field_gender' => 'Gender',
        'field_graduate' => 'Graduates',
        'field_mean_wage' => 'Mean Wage',
        'field_program' => 'Program',
        'field_race' => 'Race',
        'field_school_year' => 'School Year',
      ]
    ],
    'enrollment_by_type' => 
      [
      'name' => 'Enrollment by Type', 
      'fields' => [
        'field_after_year' => 'After Year',
        'field_agency' => 'Agency',
        'field_campus' => 'Campus',
        'field_credential' => 'Credential',
        'field_enrollment' => 'Enrolled',
        'field_enrollment_type' => 'Enrollment Type',
        'field_gender' => 'Gender',
        'field_graduate' => 'Graduates',
        'field_program' => 'Program',
        'field_race' => 'Race',
        'field_school_year' => 'School Year',
      ]
    ]
  ];

  public function getTableData($database,$fieldsObj,$selectedFields,$selectedFilters,$nodetype,$termFields,$limit,$number = 0){
    $filtersData = [];
    $query = $database->select('node_field_data', 'nd');
    if(!empty($selectedFields)){
      $counter = 1;
      if(!empty($selectedFilters)){
        $filtersData = array_column($selectedFilters,'field');
      }
      foreach ($selectedFields as $name => $field) {
        if(!in_array($name, $filtersData) && $name != 'field_gender' && $name != 'field_race'){
          $query->join('node__'.$name, 'na'.$counter, 'na'.$counter.'.bundle = "'.$nodetype.'" and nd.nid = na'.$counter.'.entity_id');
          if(in_array($name, $termFields)){
            $fieldSuffix = '_target_id';
          }else{
            $fieldSuffix = '_value';
          }
          $query->addField('na'.$counter, $name.$fieldSuffix, $name);
          /*if($field['sort'] == 'on'){
            $sortField = $field;
            $query->orderBy($sortField['machine_name'], $sortField['sort_order']);
          }*/
          $counter++;
        }
      }
    }
    
    /*add default gender and race filters if not exist => start*/
    if(!in_array('field_gender', $filtersData)){
      $query->join('node__field_gender', 'nge', 'nge.bundle = "'.$nodetype.'" and nd.nid = nge.entity_id');
      $query->addField('nge','field_gender_target_id','field_gender');
      $gender_tid = self::getTermData($database, 'gender', 'All')->tid;
      $query->condition('nge.field_gender_target_id', $gender_tid);
    }

    if(!in_array('field_race', $filtersData)){
      $query->join('node__field_race', 'nra', 'nra.bundle = "'.$nodetype.'" and nd.nid = nra.entity_id');
      $query->addField('nra', 'field_race_target_id', 'field_race');
      $race_tid = self::getTermData($database, 'race', 'All')->tid;
      $query->condition('nra.field_race_target_id', $race_tid);
    }
    /*add default gender and race filter if not exist => end */

    if(!empty($selectedFilters)){
      $fieldType = '';
      foreach ($selectedFilters as $key => $filter) {
        $filterName = $filter['field'];
        $query->join('node__'.$filterName, 'nf'.$key, 'nf'.$key.'.bundle = "'.$nodetype.'" and nd.nid = nf'.$key.'.entity_id');
       if(in_array($filterName, $termFields)){
          $fieldSuffix = '_target_id';
        }else{
          $fieldSuffix = '_value';
        }
        $query->addField('nf'.$key, $filterName.$fieldSuffix, $filterName);
        $query->condition('nf'.$key.'.'.$filterName.$fieldSuffix, $filter['value'], $filter['condition']);
      }
    }
    $query->condition('nd.type',$nodetype);
    $query->addField('nd', 'nid');

    if(!empty($limit)) {
      $offset = $limit*$number;
      $query->range($offset, $limit);
    }
    $employedData = $query->execute();
    return $employedData;
  }

  public function getTermData($database, $vid = '', $name = '', $isAll = false) {
    $query = $database->select('taxonomy_term_field_data', 'td');
    $query->fields('td',['tid', 'name', 'vid']);
    if($name != ''){
      $query->condition('td.name', $name);
    }
    if($vid != ''){
      $query->condition('td.vid', $vid);
    }
    if($isAll == false) {
      return $query->execute()->fetchObject();
    }else{
      return $query->execute()->fetchAllKeyed(0,1);
    }
  }

}