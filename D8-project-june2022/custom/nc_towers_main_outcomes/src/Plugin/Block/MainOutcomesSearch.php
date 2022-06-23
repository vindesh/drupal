<?php
namespace Drupal\nc_towers_main_outcomes\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Main Outcomes Search' Block.
 *
 * @Block(
 *   id = "main_outcomes_search",
 *   admin_label = @Translation("Main Outcomes Search Custom"),
 *   category = @Translation("Main Outcomes Search Custom"),
 * )
 */
class MainOutcomesSearch extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {     
      return [
        '#theme' => 'main_outcomes_search',
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
