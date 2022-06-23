<?php

namespace Drupal\nc_towers_report_builder\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\node\Entity\NodeType;
use Drupal\Core\Url;
use Drupal\node\Entity\Node;
use Drupal\nc_towers_report_builder\Controller\Helper;

/**
 * Defines a confirmation form to show the report builder form elements
 */
class ReportBuilderForm extends FormBase {

  protected $filterOperators = ['=' => 'Equal', '!=' => 'Not Equal', '>' => 'Greater than', '<' => 'Less than'];
  protected $defaultFilters = ['field_agency', 'field_school_year', 'field_campus'];
  
   /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $module_path = \Drupal::service('module_handler')->getModule('nc_towers_students_and_graduates_count')->getPath();
    include($module_path . '/includes/schools.php');

    $form['#tree'] = TRUE;
    $form['#attached']['library'][] = 'nc_towers_report_builder/report_form';

    $helperObj = new Helper();
    $termFields = $helperObj->termFields;
    $nodeFields = $helperObj->nodeFields;
    $excludeTerms = $helperObj->excludeTerms;
    $typeOptions = $termFieldsData = $fitlersTerms = [];
    $database = \Drupal::database();
    foreach ($nodeFields as $name => $data) {
      $typeOptions[$name] = $data['name'];
      $termData = '';
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
          $termData = $helperObj->getTermData($database, $vid, '',true);
          foreach ($excludeTerms as $term) {
            $remove_tid = $helperObj->getTermData($database, '', $term)->tid;
            if(isset($termData[$remove_tid])){
              unset($termData[$remove_tid]);
            }
          }
          $fitlersTerms[$id] = $termData;
          $termFieldsData[$id] = $helperObj->getTermData($database, $vid, '',true);
        }
      }
    }

    $current_path = \Drupal::request()->query->all(); 
    $type = '';
    if(isset($current_path['node_type']) && !empty($current_path['node_type'])){
      $type = $current_path['node_type'];
    }

    $form['type'] =[
      '#type' => 'select',
      '#title' => t('Data set'),
      "#empty_option"=>t('Please Select'),
      '#options' => $typeOptions,
      '#default_value' => $type,
      '#ajax' => [
        'callback' => '::getFieldsCallback',
        'wrapper' => 'report-form-wrapper',
      ],
      '#wrapper_attributes' => ['class' => ['display-star']],
    ];

    $form['main_wrapper'] = [
      '#type' => 'div',
      '#title' => 'Main',
      '#prefix' => '<div id="report-form-wrapper">',
      '#suffix' => '</div>',
    ];
    
    $bundle = $form_state->getValue('type');
    if(empty($bundle)){
      $bundle = $type;
    }
    
    $fieldsArr = $filtersArr = $defaultFiltersArr = $filterFieldsArr = [];
    $filterFields = $form_state->getValue(['main_wrapper', 'filter_wrapper']);
    if(!empty($filterFields)){
      foreach ($filterFields as $key => $filterItem) {
        if(is_array($filterItem)){
          $filterFieldsArr[] = $filterItem;
        }
      }
    }

    /*Filters default values*/
    if(!empty($filterFieldsArr)){
      $defaultFiltersArr = $filterFieldsArr;
    }elseif(isset($current_path['filters']) && !empty($current_path['filters'])){
      $defaultFiltersArr = unserialize($current_path['filters']);
    }

    if(!empty($defaultFiltersArr)){
      if($defaultFiltersArr[2]['field'] == 'field_program'){
        array_pop($this->defaultFilters);
        array_push($this->defaultFilters, 'field_program');
      }elseif($defaultFiltersArr[2]['field'] == 'field_campus'){
        array_pop($this->defaultFilters);
        array_push($this->defaultFilters, 'field_campus');
      }
    }

    if(!empty($bundle)){   
      $fieldsArr = $nodeFields[$bundle]['fields']; /*Get fields for Popup section*/
      $customFilterFields = array_diff(array_keys($fieldsArr), $this->defaultFilters);
      if(!empty($customFilterFields)){
        foreach ($customFilterFields as $key => $name) {
          $filtersArr[$name] = $fieldsArr[$name];  /*Get fields for filters*/
        }
      }
    }

    /*Fields Inputs*/
    $defaultFieldsArr = $defaultFields = $tableHeader = [];
    if(isset($current_path['fields']) && !empty($current_path['fields'])){
      $defaultFieldsArr = unserialize($current_path['fields']);
      $defaultFields = array_column($defaultFieldsArr, 'machine_name'); //default value for popup section fields
    }
    $selectedFields = $form_state->get('selected_fields');
    if(empty($selectedFields)){
      if(!empty($defaultFieldsArr)){
        $selectedFields = $defaultFieldsArr;
      }
    }
    $form['main_wrapper']['fields_wrapper'] = [
      '#type' => 'fieldset',
      '#title' => 'Data Fields',
      '#prefix' => '<div id="data-set-wrapper">',
      '#suffix' => '</div>',
    ];

    //$tableHeader['nid'] = 'nid'; 
    if(!empty($selectedFields)){
      foreach ($selectedFields as $name => $data) {
        $displaName = $machine_name = $fieldName = $sortOrder = '';
        $machine_name = $name;
        if(isset($fieldsArr[$machine_name]) && !empty($fieldsArr[$machine_name])){
          $fieldName = $fieldsArr[$machine_name];
        
          if(isset($selectedFields[$machine_name]['display_name']) && !empty($selectedFields[$machine_name]['display_name'])){
              $displaName = $selectedFields[$machine_name]['display_name'];
          }else{
            $displaName = $fieldName;
          }
          $tableHeader[$machine_name] = $displaName; 
          $form['main_wrapper']['fields_wrapper'][$name]['machine_name'] = [
            '#type' => 'hidden',
            '#value' => $machine_name,
            '#prefix' => '<div class="item">',
          ];
          $form['main_wrapper']['fields_wrapper'][$name]['field'] = [
            '#type' => 'textfield',
            '#title' => t('Field'),
            '#disabled' => true,
            '#default_value' => $fieldName,
          ];
          $form['main_wrapper']['fields_wrapper'][$name]['display_name']= [
            '#type' => 'textfield',
            '#title' => t('Display Name'),
            '#attributes' => ['class' => ['display-name']],
            '#default_value' => $displaName,
            '#suffix' => '</div>'
          ];
        }
        /*if(isset($defaultFieldsArr[$machine_name]['sort']) && !empty($defaultFieldsArr[$machine_name]['sort'])){
          $attributesData = ['class' => ['sorting-btn'], 'checked' => TRUE];
        }else{
          $attributesData = ['class' => ['sorting-btn']];
        }
        if(isset($defaultFieldsArr[$machine_name]['sort_order']) && !empty($defaultFieldsArr[$machine_name]['sort'])){
          $sortOrder = $defaultFieldsArr[$machine_name]['sort_order'];
        }
        $form['main_wrapper']['fields_wrapper'][$name]['sort'] = [
          '#type' => 'radio',
          '#title' => t('Sort'),
        	'#attributes' => $attributesData,
          '#wrapper_attributes' => ['class' => ['sorting-wrap']],
        ];
        $form['main_wrapper']['fields_wrapper'][$name]['sort_order'] = [
          '#type' => 'select',
          '#title' => t('Order'),
          '#attributes' => ['class' => ['sorting-order']],
          '#wrapper_attributes' => ['class' => ['sorting-order-wrap']],
          '#options' => ['ASC' => 'Ascending', 'DESC' => 'Descending'],
          '#default_value' => $sortOrder
        ];*/
      }
    }
    $form['main_wrapper']['fields_wrapper']['add_fields'] = [
      '#type' => 'button',
      '#value' => t('Choose Columns'),
      '#attributes' => ['class' => ['add-field-btn']]
    ];
    // If there is more than one name, add the remove button.
    /*if ($row_count > 1) {
      $form['main_wrapper']['fields_wrapper']['remove_field'] = [
        '#type' => 'submit',
        '#value' => t('Remove one'),
        '#submit' => ['::removeFieldCallback'],
        '#ajax' => [
          'callback' => '::addFieldCallback',
          'wrapper' => 'data-set-wrapper',
        ],
      ];
    }*/

    /*Popup fields*/
    $form['main_wrapper']['popup_wrapper'] = [
      '#type' => 'fieldset',
      '#title' => 'Select Data fields',
      '#prefix' => '<div id="popup-wrapper" class="d-none">',
      '#suffix' => '</div>',
    ];
    
    $form['main_wrapper']['popup_wrapper']['ct_fields'] = [
      '#type' => 'checkboxes',
      '#title' => t('Fields'),
      '#options' => $fieldsArr,
      '#default_value' => $defaultFields
    ];

    $form['main_wrapper']['popup_wrapper']['add_fields'] = [
      '#type' => 'submit',
      '#value' => t('Finalize Columns'),
      '#submit' => ['::fieldIncrement'],
      '#attributes' => ['class' => ['popup-field-btn']],
      '#prefix' => '<div class="popup-btn-wrap"><span class="toggle-popup"></span>',
      '#suffix' => '</div>',
      '#ajax' => [
        'callback' => '::addFieldCallback',
        'wrapper' => 'data-set-wrapper',
      ],
    ];

    /*Filters*/
    $filter_row_count = $form_state->get('filter_row_count');
    if ($filter_row_count === NULL) {
      $form_state->set('filter_row_count', 3);
      $filter_row_count = 3;
      if(!empty($defaultFiltersArr)){
        $filter_row_count = count($defaultFiltersArr);
        $form_state->set('filter_row_count', $filter_row_count);
      }
    }
    $form['main_wrapper']['filter_wrapper'] = [
      '#type' => 'fieldset',
      '#title' => 'Filters',
      '#prefix' => '<div id="filter-wrapper">',
      '#suffix' => '</div>',
    ];
    $static_condition = '=';
    $static_operators[$static_condition] =  $this->filterOperators[$static_condition];
    for ($j = 0; $j < $filter_row_count; $j++) {
      $fieldName = $condition = $value = $getTerms = $hideClass = '';
      $filtersOptions = $termsOptions = [];
      $operators = $this->filterOperators;
      if(isset($defaultFiltersArr[$j]['field']) && !empty($defaultFiltersArr[$j]['field'])){
        $fieldName = $defaultFiltersArr[$j]['field'];
      }
      if(isset($defaultFiltersArr[$j]['condition']) && !empty($defaultFiltersArr[$j]['condition'])){
        $condition = $defaultFiltersArr[$j]['condition'];
        if(in_array($fieldName, $termFields)){
          $operators = $static_operators;
          $termsOptions = $fitlersTerms[$fieldName];
        }
      }
      if(isset($defaultFiltersArr[$j]['value']) && !empty($defaultFiltersArr[$j]['value'])){
        $value = $defaultFiltersArr[$j]['value'];
      }

      $fieldPrefix =  '';
      $fieldSuffix = '';
      $elementWrapper = 'item';
      if($j == 0){
        $fieldName = 'field_agency';
        $filtersOptions['field_agency'] = $label = 'Agency';
        $termsOptions = $fitlersTerms[$fieldName];
        $operators = $static_operators;
        $hideClass = 'd-none';
        $mandatoryField = 'display-star';
        $fieldPrefix = '<div class="agency-year-wrapper">';
      }elseif($j == 1){
        $fieldName = 'field_school_year';
        $filtersOptions['field_school_year'] = $label = 'School Year';
        $termsOptions = $fitlersTerms[$fieldName];
        $operators = $static_operators;
        $hideClass = 'd-none';
        $mandatoryField = 'display-star';
        $fieldSuffix = '</div>';
      }elseif($j == 2){
        $label = 'Campus/Program';
        $filtersOptions['field_campus'] = 'Campus';
        $filtersOptions['field_program'] = 'Program';
        $operators = $static_operators; 
        $mandatoryField = 'display-star'; 
      }else{
        $filtersOptions = $filtersArr;
        $label = 'Field';
        $mandatoryField = '';
      }
      if(!empty($defaultFiltersArr[0]['value'])){
        $aid = $defaultFiltersArr[0]['value'];
        $agencyName = $fitlersTerms['field_agency'][$aid];
        if($fieldName == 'field_campus'){
          $getTerms = array_intersect($fitlersTerms[$fieldName], $schools[$agencyName]);
          $termsOptions = $getTerms;
        }elseif($fieldName == 'field_program'){
          $getTerms = array_intersect($fitlersTerms[$fieldName], $programs[$agencyName]);
          $termsOptions = $getTerms;
        }
      }

      $defaultFieldOptions = [
        '#type' => 'select',
        '#title' => t($label),
        '#options' => $filtersOptions,
        '#default_value' => $fieldName,
        '#ajax' => [
          'callback' => '::addFilterCallback',
          'wrapper' => 'filter-wrapper',
        ],
        '#wrapper_attributes' => ['class' => [$hideClass, $mandatoryField]],
        "#prefix" => $fieldPrefix.'<div class="'.$elementWrapper.'">',
      ];
      //if($j ==2){
        $defaultFieldOptions['#empty_option'] = t('Please Select');
      //}
      $form['main_wrapper']['filter_wrapper'][$j]['field'] = $defaultFieldOptions;
      
      $form['main_wrapper']['filter_wrapper'][$j]['condition'] = [
        '#type' => 'select',
        '#title' => t('Condition'),
        '#options' => $operators,
        '#default_value' => $condition,
        '#wrapper_attributes' => ['class' => [$hideClass]]
      ];

      if(!empty($termsOptions)){
        $listLabel = 'Value';
        if($j == 0 || $j == 1 ){
          $listLabel = $label;
        }
        $defaultValueOptions = [
          '#type' => 'select',
          '#title' => t($listLabel),
          '#default_value' => $value,
          '#options' => $termsOptions,
          '#empty_option' => t('Please Select'),
          '#wrapper_attributes' => ['class' => [$mandatoryField]],
          '#suffix' => '</div>'.$fieldSuffix
        ];
        if($j == 0){
          $defaultValueOptions['#ajax'] = [
            'callback' => '::addFilterCallback',
            'wrapper' => 'filter-wrapper',
          ];
        }
        /*if($j == 0 ||  == 1 || $j == 2){
          $defaultValueOptions['#required'] = true;
        }*/
        $form['main_wrapper']['filter_wrapper'][$j]['value']= $defaultValueOptions;
      }else{
        $form['main_wrapper']['filter_wrapper'][$j]['value']= [
          '#type' => 'textfield',
          '#title' => t('Value'),
          '#default_value' => $value,
          '#suffix' => '</div>'.$fieldSuffix
        ];
      }
    }

    $form['main_wrapper']['filter_wrapper']['add_filter'] = [
      '#type' => 'submit',
      '#value' => t('Add Filter'),
      '#submit' => ['::filterIncrement'],
      '#ajax' => [
        'callback' => '::addFilterCallback',
        'wrapper' => 'filter-wrapper',
      ],
      "#prefix" => '<div class="filter-btn-wrap">',
    ];

    if ($filter_row_count > 3) {
      $form['main_wrapper']['filter_wrapper']['remove_filter'] = [
        '#type' => 'submit',
        '#value' => t('Remove Filter'),
        '#submit' => ['::removeFilterCallback'],
        '#ajax' => [
          'callback' => '::addFilterCallback',
          'wrapper' => 'filter-wrapper',
        ],
        '#suffix' => '</div>',
      ];
    } else{
      $form['main_wrapper']['filter_wrapper']['add_filter']["#suffix"] = '</div>';
    }

    $form['actions'] = [
      '#type' => 'actions',
      '#attributes' => ['class' => ['run-report']]
    ];
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => t('Run Report'),
    ];

    $form['actions']['start_over'] = array(
      '#type' => 'button',
      '#value' => t('Start over')
    );

    $outputData = $rows = [];
    $data = $preBtn = $nextBtn = '';
    $pageNumber = $totalItems = 0;
    $limit = 100;
    $filterFields = array_column($defaultFiltersArr, 'field');
    if(!empty($fieldsArr) && !empty($defaultFieldsArr) && !in_array('', $filterFields)){
      if(isset($current_path['page']) && !empty($current_path['page'])){
        $pageNumber =  $current_path['page'];
      }
      
      $outputData = $helperObj->getTableData($database,$fieldsArr,$defaultFieldsArr,$defaultFiltersArr,$bundle,$termFields,$limit,$pageNumber);
      if(!empty($outputData)) {
        foreach ($outputData as $key => $nodeArr) {
          foreach ($tableHeader as $id => $name) {
            if(isset($nodeArr->$id)){
              $data = $nodeArr->$id;
              if(!in_array($id, $termFields)){
                $data = number_format($data);
                if($data == '-1') {
                  $data = t('Data Suppressed');
                }
              }
              if(in_array($id, $termFields)){
                if(isset($termFieldsData[$id][$data])){
                  $data = $termFieldsData[$id][$data];
                }
              }
              $rows[$key][$id] = $data;
            }
          }
          $totalItems++;
        }
        
        $form['table'] = [
          '#type' => 'table',
          '#header' => $tableHeader,
          '#attributes' => ['class' => ['views-table'], 'width' => '100%'],
          '#rows' => $rows,
          '#caption' => t('Report'),
          '#weight' => 101,
        ];
      
        $previousPageParams = $nextPageParams = $current_path;
        if($pageNumber > 0){
          $previousPageParams['page'] = $pageNumber - 1;
          $preUrl = Url::fromRoute('nc_towers_report_builder.builder_form', $previousPageParams)->toString();
          $preBtn = '<a href="'.$preUrl.'" class="pre"><<< Previous</a>';
        }
        if($totalItems == 100){
          $nextPageParams['page'] = $pageNumber + 1;
          $nextUrl = Url::fromRoute('nc_towers_report_builder.builder_form', $nextPageParams)->toString();
          $nextBtn = '<a href="'.$nextUrl.'" class="next">Next >>></a>';
        }
        $form['pager'] = [
          '#type' => 'markup',
          '#markup' => '<div class="pager-wrap">'.$preBtn.$nextBtn.'</div>',
          '#weight' => 101,
        ];
        if(!empty($rows)){
          $downloadParams = $current_path;
          if(!empty($downloadParams)){
            unset($downloadParams['page']);
            $downloadUrl = Url::fromRoute('nc_towers_report_builder.download', $downloadParams)->toString();
            $downloadBtn = '<a href="'.$downloadUrl.'" class="button">Export to CSV</a>';
          
            $form['download_btn'] = [
              '#type' => 'markup',
              '#markup' => '<div class="download-wrap">'.$downloadBtn.'</div>',
              '#weight' => 100,
            ];
          }
        }
      }      
    }
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'report_builder_form';
  }

  /**
   * Validate handler
   * 
   * @param array $form
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   * 
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $type = $form_state->getValue('type');
    if(empty($type)){
      $form_state->setErrorByName('type', t('Data set field is required.'));
    }
    $triggeringElement = $form_state->getTriggeringElement();
    if(is_object($triggeringElement['#value'])){
      if($triggeringElement['#value']->__toString() != 'Finalize Columns'){
        $filterFields = $form_state->getValue(['main_wrapper', 'filter_wrapper']);
        $fieldWrapper = $form['main_wrapper']['filter_wrapper'];
        if(empty($filterFields[0]['value'])){
          $form_state->setError($fieldWrapper[0]['value'], t('Agency value is required.'));
        }
        if(empty($filterFields[1]['value'])){
          $form_state->setError($fieldWrapper[1]['value'], t('School Year value is required.'));
        }
        if(empty($filterFields[2]['field'])){
          $form_state->setError($fieldWrapper[2]['field'], t('Campus/Program field is required.'));
        }
        if(empty($filterFields[2]['value'])){
          $form_state->setError($fieldWrapper[2]['value'], t('Campus/Program value is required.'));
        }
      }
    }
    
  }

  /**
   * Form submission handler.
   *
   * @param array $form
   *   An associative array containing the structure of the form.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
  	$values = $form_state->getValues();
    $encodedData = $fields = $filters = $field_params = $filter_params = [];

    $encodedData['node_type'] = $values['type'];
    $fields = $values['main_wrapper']['fields_wrapper'];
    if(!empty($fields)){
      foreach ($fields as $key => $field) {
        if(is_array($field)){
          $field_params[$field['machine_name']] = $field;
        }
      }
      if(!empty($field_params)){
        $encodedData['fields'] = serialize($field_params);
      }
    }

    $filters = $values['main_wrapper']['filter_wrapper'];
    if(!empty($filters)){
      foreach ($filters as $key => $filter) {
        if(is_array($filter)){
          $filter_params[$key] = $filter;
        }
      }
      if(!empty($filter_params)){
        $encodedData['filters'] = serialize($filter_params);
      }
    }
    $url = Url::fromRoute('nc_towers_report_builder.builder_form', $encodedData);
    $form_state->setRedirectUrl($url);
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldsCallback(array &$form, FormStateInterface $form_state) {
    return $form['main_wrapper'];
  }

  /**
   * {@inheritdoc}
   */
  public function addFieldCallback(array &$form, FormStateInterface $form_state) {
    return $form['main_wrapper']['fields_wrapper'];
  }

  /**
   * {@inheritdoc}
   */
  public function addFilterCallback(array &$form, FormStateInterface $form_state) {
    return $form['main_wrapper']['filter_wrapper'];
  }

  /**
   * {@inheritdoc}
   */
  public function fieldIncrement(array &$form, FormStateInterface $form_state) {
    $fields = $form_state->getValue(['main_wrapper', 'popup_wrapper', 'ct_fields']);
    $selectedFields = [];
    if(!empty($fields)){
      $selectedFields = array_filter($fields);
    }
    $form_state->set('selected_fields', $selectedFields);
    $form_state->setRebuild();
  }

  /**
   * {@inheritdoc}
   */
  public function filterIncrement(array &$form, FormStateInterface $form_state) {
    $row_count = $form_state->get('filter_row_count');
    $row_count = $row_count + 1;
    $form_state->set('filter_row_count', $row_count);
    $form_state->setRebuild();
  }

  /**
   * {@inheritdoc}
   */
  public function removeFieldCallback(array &$form, FormStateInterface $form_state) {
    $row_count = $form_state->get('row_count');
    if ($row_count > 1) {
      $row_count = $row_count - 1;
      $form_state->set('row_count', $row_count);
    }
    $form_state->setRebuild();
  }

  /**
   * {@inheritdoc}
   */
  public function removeFilterCallback(array &$form, FormStateInterface $form_state) {
    $row_count = $form_state->get('filter_row_count');
    if ($row_count > 3) {
      $row_count = $row_count - 1;
      $form_state->set('filter_row_count', $row_count);
    }
    $form_state->setRebuild();
  }
}
