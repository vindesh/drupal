<?php

namespace Drupal\nc_towers_mean_wage\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;


/**
 * Provides a 'Mean Wages Multi Search' block.
 *
 * @Block(
 *  id = "mean_wage_multi_search",
 *  admin_label = @Translation("Students graduates multi search"),
 *  category = @Translation("Students and graduates Multi Search Custom"),
 * )
 */
class MeanWageMultiSearch extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {   
      //$library['library'][] = 'nccis_students_and_graduates_count/student_multi_search';
      $current_path = \Drupal::request()->query->all();
      $query_param = '';
      if( count($current_path) > 0) {
        $amper = '';
        $query_param = '?';
        foreach($current_path as $key => $value){
          $query_param .= $amper.$key.'='.$value;
          $amper = '&';
        }
      }
      return [
        '#theme' => 'mean_wage_multi_search',
        '#results' => '',
        '#query_param' => $query_param,
        //'#attached'=>$library,
        '#cache' => array('max-age' => 0),
      ];
  }

    /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return 0;
  }

}
