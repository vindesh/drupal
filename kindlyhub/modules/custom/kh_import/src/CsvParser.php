<?php
/**
 * @file
 * Contains \Drupal\kh_import\CsvParser.
 */

namespace Drupal\kh_import;

use Drupal\Core\Entity\EntityTypeManager;
/**
 * CsvParser manager.
 */
class CsvParser {
  public $csvFileName;
  /**
   * {@inheritdoc}
   */
  public function getCsvById($id) {
    /* @var \Drupal\file\Entity\File $entity */
    $entity = $this->getCsvEntity($id);
    if ($entity && !empty($entity)) {
      $this->csvFileName = $entity->getFilename();
      $str_getcsv  = array_map('str_getcsv', file($entity->uri->getString()));
      $str_getcsv  = $this->clean_empty($str_getcsv);
      return $str_getcsv;
    }
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function getCsvFieldsById($id) {
    $csv = $this->getCsvById($id);
    if ($csv && is_array($csv)) {
      return $csv[0];
    }
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function getCsvEntity($id) {
    if ($id) {
      // Get a file storage object.
      $file_storage = \Drupal::entityTypeManager()->getStorage('file');
      // Load a single file.
      return $file_storage->load($id);
    }
    return NULL;
  }

  public function clean_empty($str_getcsv){
    $clean_array = [];
    foreach($str_getcsv as $row){
      $empty_row = array_diff($row, ['']);
      if ( count($empty_row) > 0 ){
        $clean_array[] = $row;
      }
    }
    return $clean_array;
  }
}
