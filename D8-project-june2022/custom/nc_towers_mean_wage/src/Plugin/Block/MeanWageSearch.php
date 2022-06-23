<?php
namespace Drupal\nc_towers_mean_wage\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a 'Mean Wages Search' Block.
 *
 * @Block(
 *   id = "mean_wage_search",
 *   admin_label = @Translation("Mean Wages Search Custom"),
 *   category = @Translation("Mean Wages Search Custom"),
 * )
 */
class MeanWageSearch extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
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
        '#theme' => 'mean_wage_search',
        '#results' => '',
        '#query_param' => $query_param,
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
