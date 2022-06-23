<?php

namespace Drupal\nc_towers_students_and_graduates_count\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;


/**
 * Provides a 'Students Graduates Multi Search' block.
 *
 * @Block(
 *  id = "students_graduates_multi_search",
 *  admin_label = @Translation("Students graduates multi search"),
 *  category = @Translation("Students and graduates Multi Search Custom"),
 * )
 */
class StudentsGraduatesMultiSearch extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {   
      //$library['library'][] = 'nccis_students_and_graduates_count/student_multi_search';
      return [
        '#theme' => 'students_graduates_multi_search',
        '#results' => '',
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
