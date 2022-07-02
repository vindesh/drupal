<?php

function dms_theme_preprocess_page(&$variables) {

  //check if we're on a user profile page
  //add var to check
  //for the fancy design part
  if(\Drupal::routeMatch()->getParameter('user')) {
    //user page
    $variables['page']['vars']['user_page'] = TRUE;
  }

}
