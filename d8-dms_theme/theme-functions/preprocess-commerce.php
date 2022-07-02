<?php

function dms_theme_preprocess_commerce_product(&$variables) {

  $projects_block = \Drupal\block\Entity\Block::load('views_block__pattern_projects_block_1');
  if($projects_block) {
    $projects_block_view = \Drupal::entityTypeManager()->getViewBuilder('block')->view($projects_block);
    if($projects_block_view) {
      $variables['custom']['projects_block'] = $projects_block_view;
    }
  }

  $projects_notice_block = \Drupal\block\Entity\Block::load('patternnotice');
  if($projects_notice_block) {
    $projects_notice_block_view = \Drupal::entityTypeManager()->getViewBuilder('block')->view($projects_notice_block);
    if($projects_notice_block_view) {
      $variables['custom']['projects_notice'] = $projects_notice_block_view;
    }
  }

  // $cta = \Drupal\block\Entity\Block::load('views_block__cta_block_1_2');
  // if($cta) {
  //   $ctaView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($cta);
  //   if($ctaView) {
  //     $variables['custom']['cta'] = $ctaView;
  //   }
  // }

  // Modal

  $path =  \Drupal::request()->getRequestUri();

  $destination = '?destination=' . $path;


  $gsNode = \Drupal\node\Entity\Node::load(388);
  $field = \Drupal::entityManager()->getTranslationFromContext($gsNode)->field_product_popup_text;


  $popup = $field->value;
  $button1 = '<a class="btn btn--blue" href="/'.\Drupal::languageManager()->getCurrentLanguage()->getId().'/user/login' . $destination . '" >'.t("Login").'</a>';
  $button2 = '<a class="btn btn--blue" href="/'.\Drupal::languageManager()->getCurrentLanguage()->getId().'/user/register' . '">'.t("Register").'</a>';
  $popup .= '<p>' . $button1 . $button2 . '</p>';

  $variables['custom']['modal'] = $popup;



}
