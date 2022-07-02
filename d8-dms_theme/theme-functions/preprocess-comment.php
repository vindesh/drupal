<?php
// function THEME_NAME_preprocess_comment(&$variables) {
//   // Getting the node creation time stamp from the comment object.
//   $date = $variables['comment']->getCreatedTime();
//   // Here you can use drupal's format_date() function, or some custom php date formatting.
//   $variables['created'] = \Drupal::service('date.formatter')->formatInterval(REQUEST_TIME - $date);
//   $variables['submitted'] = t('@username commented !datetime', array('@username' => $variables['author'], '!datetime' => '<span class="comments-ago">' . $variables['created'] . ' ago </span>'));
// }

function dms_theme_preprocess_comment(&$variables) {
// var_dump($variables);
  $date = $variables['comment']->getCreatedTime();
  $variables['comment_date'] = \Drupal::service('date.formatter')->format($date,'medium');

}
