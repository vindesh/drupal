<?php

function dms_theme_preprocess_block(&$variables) {
  switch($variables['base_plugin_id']) {
    case 'system_branding_block':
      $variables['site_logo'] = str_replace('.svg','.png',$variables['site_logo']);
      break;
    case 'language_block':
      foreach($variables['content']['#links'] as $i => $link) {
        $variables['content']['#links'][$i]['title'] = $i;
      }
      break;
  }
}


// function dms_theme_preprocess_page_title(&$variables) {
//
//   $user = \Drupal\user\Entity\User::load(\Drupal::currentUser()->id());
//
//   $first_name = $user->get('field_first_name')->value;
//   $last_name = $user->get('field_last_name')->value;
//
// }
