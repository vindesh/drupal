<?php
namespace Drupal\nc_towers_custom_twig\Twig\Extension;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;
use Twig\TwigFunction;
/**
 * Class DefaultService.
 *
 * @package Drupal\CustomTwigExtension
 */
//class CustomTwigExtension extends \Twig_Extension {
class CustomTwigExtension extends AbstractExtension {
  /**
   * In this function we can declare the extension ksort filter
   */
  public function getFilters() {
    // $this->filters['ksort'] = new \Twig_SimpleFilter('ksort', array($this, 'ksort'));
    // return $this->filters;
    return [
            new TwigFilter('ksort', [$this, 'ksort']),
        ];
  }
  /**
   * The php function to kshort twig array filter
   */
  public function ksort($array) {
    ksort($array);
    return $array;
  }
}
