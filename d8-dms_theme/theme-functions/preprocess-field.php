<?php
use Drupal\file\Entity\File;
/**
 * D8 Media is a clusterfuck. When using the Thumbnail formatter to output a simple image,
 * all images on the site are output with alt text "Thumbnail" and title text equal to the
 * title of the Media item. The (SEO) entered alt text of the entity is never used!
 * @param $variables
 */
function dms_theme_preprocess_field(&$variables) {

  // $fieldName = ($variables['element']['#field_name']);
  // switch ($fieldName) {}

  switch ($variables['field_type']) {
    case 'entity_reference':
      $element = $variables['element'];

      if ($element['#formatter'] == 'media_thumbnail') {
        foreach ($variables['items'] as $key => $item) {
          /** @var \Drupal\image\Plugin\Field\FieldType\ImageItem $image */
          $image = &$item['content']['#item'];
          // Retrieve the alt & title text entered on the actual image
          $alt = $image->getEntity()->field_media_image->first()->alt;
          $title = $image->getEntity()->field_media_image->first()->title;

          // Override the Media Thumbnail formatter hardcoded defaults
          $image->set('alt', $alt)->set('title', $title);
        }
      }
      break;
  }

}



function dms_theme_preprocess_file_link(&$variables) {
  // Retrieve an array which contains the path pieces.
  $current_path = \Drupal::service('path.current')->getPath();
  $path_args = explode('/', $current_path);
  if($path_args[1] == 'product'){
    // Add target _blank attribute to all file links.
    $file = $variables['file'];
    $url = file_create_url($file->uri->value);
    // Use the description as the link text if available.
    if (empty($variables['description'])) {
      $link_text = $file->filename->value;
    }
    else {
      $link_text = $variables['description']->__toString();
    }

    
    $link = '<a href="' . $url . '" type="' . $file->filemime->value . '" length="' . $file->filesize->value . '" title="' . \Drupal\Component\Utility\Html::escape($file->filename->value) . '" target="_blank">' . \Drupal\Component\Utility\Html::escape($link_text) . '</a>';
     //print $link;
    //$variables['link']->setGeneratedLink($link);
  }

}

