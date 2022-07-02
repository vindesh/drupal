<?php

use Drupal\user\Entity\User;

function dms_theme_preprocess_user(&$variables) {
  $user = &$variables['user'];

  $account = User::load(\Drupal::currentUser()->id());
  $variables['custom']['is_me'] = !empty($account) && !empty($user) && $account->id() == $user->id();


  if (\Drupal::languageManager()->getCurrentLanguage()->getId() === 'nl') {
    $fbshare = \Drupal\block\Entity\Block::load('facebooksharelinkblock');
    if ($fbshare) {
      $fbshareView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($fbshare);
      if ($fbshareView) {
        $variables['custom']['fbshare'] = $fbshareView;
      }
    }
  }

}
