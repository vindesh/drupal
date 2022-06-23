<?php
namespace Drupal\nc_towers_main_outcomes\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Multiple Main Outcomes Search' Block.
 *
 * @Block(
 *   id = "multiple_main_outcomes_search",
 *   admin_label = @Translation("Multiple Main Outcomes Search Custom"),
 *   category = @Translation("Multiple Main Outcomes Search Custom"),
 * )
 */
class MultipleMainOutcomesSearch extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {     
    return [
      '#theme' => 'multiple_main_outcomes_search',
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
