<?php

namespace Drupal\nc_towers_students_and_graduates_count\Plugin\Block;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Block\BlockBase;
use Drupal\taxonomy\Entity\Term;
use Drupal\node\Entity\Node;

/**
 * Provides a 'Students Graduates Search' Block.
 *
 * @Block(
 *   id = "students_graduates_search",
 *   admin_label = @Translation("Students and graduates Search Custom"),
 *   category = @Translation("Students and graduates Search Custom"),
 * )
 */
class StudentsGraduatesSearch extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {     
      return [
        '#theme' => 'students_graduates_search',
        '#results' => '',
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
