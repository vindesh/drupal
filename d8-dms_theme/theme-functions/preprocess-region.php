<?php

function dms_theme_preprocess_region(&$variables) {

  $variables['content'] = $variables['elements']['#children'];
  $variables['region'] = $variables['elements']['#region'];

  if ($variables['region'] == 'sidebar_first') {}

}