<?php

// use Drupal\Core\Url;
use Drupal\image\Entity\ImageStyle;

function dms_theme_preprocess_node(&$variables) {
  /** @var \Drupal\node\Entity\Node $node */
  $node = &$variables['node'];

  switch ($node->getType()) {
    case 'project':
      // Gallery images
      $images = $node->field_images;
      foreach($images as $image) {
        $variables['custom']['gallery_images'][] = ImageStyle::load('detail_gallery')->buildUrl($image->entity->getFileUri());
      }

      // Custom user variables
      $uid = $node->getOwnerId();
      $user = \Drupal\user\Entity\User::load($uid);

      $variables['custom']['author_name'] = $user->getDisplayName();

      if (!$user->user_picture->isEmpty()) {
        $image = \Drupal\user\Entity\User::load($uid)->user_picture->first()->view('user_picture');
        $image = \Drupal::service('renderer')->render($image);
      } else {
        // todo: get default image (silhouet) from theme
        $image = '';
      }

      $variables['custom']['author_image'] = $image;
      $variables['custom']['uid'] = $user->uid->getString();

      // Comment Count
      $variables['custom']['comment_count'] = $node->get('field_comments')->comment_count;

      // Like Count
      $connection = \Drupal::database();
      $count = $connection
        ->select('flag_counts', 'fc')
        ->fields('fc', ['count'])
        ->condition('fc.flag_id', 'project_like')
        ->condition('fc.entity_id', $node->id())
        ->execute()
        ->fetchField();
      $variables['custom']['like_count'] = $count ?: 0;

      // Modal
      $gsNode = \Drupal\node\Entity\Node::load(388);
      $field = \Drupal::entityManager()->getTranslationFromContext($gsNode)->field_creation_popup_text;
      // $field = $gsNode->get('field_creation_popup_text');
      $path =  \Drupal::request()->getRequestUri();
      $destination = '?destination=' . $path;
      $popup = $field->value;
      $button1 = '<a class="btn btn--blue" href="/nl/user/login' . $destination . '" >Login</a>';
      $button2 = '<a class="btn btn--blue" href="/nl/user/register' . '">Register</a>';
      $popup .= '<p>' . $button1 . $button2 . '</p>';
      $variables['custom']['modal'] = $popup;

      // // CTA
      // $cta = \Drupal\block\Entity\Block::load('views_block__cta_block_1_2');
      // if($cta) {
      //   $ctaView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($cta);
      //   if($ctaView) {
      //     $variables['custom']['cta'] = $ctaView;
      //   }
      // }
      
      $nodepatterns = \Drupal\commerce_product\Entity\Product::load($node->field_patterns->target_id);
      $variables['custom']['pattern_view'] = \Drupal::entityTypeManager()->getViewBuilder('commerce_product')->view($nodepatterns, 'brief');


      break;

    case 'blog_category':
      // Overview
      $articles = \Drupal\block\Entity\Block::load('views_block__blog_block_2');
      if($articles) {
        $articlesView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($articles);
        if($articlesView) {
          $variables['custom']['blog_category_overview'] = $articlesView;
        }
      }
      break;

    case 'blog_article':
      // Link Party Block
      $lpb = \Drupal\block\Entity\Block::load('views_block__link_parties_overview_block_1');
      if($lpb) {
        $lpbView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($lpb);
        if($lpbView) {
          $variables['custom']['linkpartyblock'] = $lpbView;
        }
      }
      // Link Party Overview
      $lpo = \Drupal\block\Entity\Block::load('views_block__blog_article_link_party_entries_block_1');
      if($lpo) {
        $lpoView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($lpo);
        if($lpoView) {
          $variables['custom']['linkpartyoverview'] = $lpoView;
        }
      }
      // Link Party subcribe
      $lps = \Drupal\block\Entity\Block::load('linkpartyblock_2');
      if ($lps) {
        $lpsView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($lps);
        if ($lpsView) {
          $variables['custom']['linkpartysubsblock'] = $lpsView;
        }
      }
      // // CTA: Register
      // if (\Drupal::currentUser()->isAnonymous()) {
      //   $block = \Drupal\block\Entity\Block::load('ctaregisternow');
      //   $variables['custom']['cta'] = \Drupal::entityTypeManager()->getViewBuilder('block')->view($block);
      // }
      // Mailchimp
      $mailchimp = \Drupal\block\Entity\Block::load('webformulier');
      if($mailchimp) {
        $mailchimpView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($mailchimp);
        if($mailchimpView) {
          $variables['custom']['mailchimp'] = $mailchimpView;
        }
      }
      break;

    case 'homepage':
      // Countdown
      // $countdown = \Drupal\block\Entity\Block::load('countdown');
      // if($countdown) {
      //   $countdownView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($countdown);
      //   if($countdownView) {
      //     $variables['custom']['countdown'] = $countdownView;
      //   }
      // }
      // Countdown

      $gsNode = \Drupal\node\Entity\Node::load(388);
      $text = \Drupal::entityManager()->getTranslationFromContext($gsNode)->field_countdown_text;
      $file=$gsNode->field_back_image->entity;
      $variables['custom']['countdown_img']= ImageStyle::load('new_front_image_style')->buildUrl($file->getFileUri());
      $variables['custom']['countdown_name'] = \Drupal::entityManager()->getTranslationFromContext($gsNode)->field_countdown_name->value;
      $variables['custom']['countdown_text'] = $text->value;
      $clock = $gsNode->get('field_countdown');
      $clock = str_replace(array('-','T'), array('/',' '), $clock->value);
      $variables['custom']['countdown_clock'] = $clock;
      $show = $gsNode->get('field_show_countdown');
      $variables['custom']['countdown_show'] = $show->value;
      $variables['#cache']['max-age'] = 0;

      // Mailchimp
      $mailchimp = \Drupal\block\Entity\Block::load('elkeweekmassasnaaiplezierinjemailbox');
      if($mailchimp) {
        $mailchimpView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($mailchimp);
        if($mailchimpView) {
          $variables['custom']['mailchimp'] = $mailchimpView;
        }
      }
      $most_popular = \Drupal\block\Entity\Block::load('views_block__most_popular_block_1');
      if($most_popular) {
        $most_popularView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($most_popular);
        if($most_popularView) {
          $variables['custom']['most_popular'] = $most_popularView;
        }
      }
      $query = $query = \Drupal::database()->select('users_field_data', 'ufd')->fields('ufd', ['uid']);
      $query->leftJoin('user__roles', 'ur', 'ufd.uid = ur.entity_id');
      $query->condition('ufd.access', 0, '<>')
          ->condition('ufd.status', 1)
          ->condition('ur.entity_id', 'NULL', 'IS NULL');

      $variables['custom']['user_stats'] = $query->countQuery()->execute()->fetchField();
      $thisnode_storage = \Drupal::entityTypeManager()->getStorage('node');
      $thisnode = $thisnode_storage->load($variables['elements']['#node']->id());
      
      if( $thisnode->hasField('field_header_media')){
          $file  = $thisnode->get('field_header_media')->entity;
          if ($file->bundle()) {
            $bundle_type_id = $file->getEntityType()->getBundleEntityType();
            $bundle_label = \Drupal::entityTypeManager()
              ->getStorage($bundle_type_id)
              ->load($file->bundle())
              ->label();
          }
          $variables['custom']["type"] = $bundle_label;  
      }

      
      break;

    case 'quick_response':
      //only for viewmode full
      if($variables['view_mode'] == 'full') {
        if(!$node->field_background_image->isEmpty()){
          $image_uri = $node->field_background_image->entity->field_media_image->entity->getFileUri();
          $image_url = ImageStyle::load('hero_big')->buildUrl($image_uri);
          $variables['custom']['background_image_uri'] = $image_url;
        }
      }
      break;

    // case 'page':
    //   if($node->id() == 376) {
    //     $gsNode = \Drupal\node\Entity\Node::load(388);
    //     $field = $gsNode->get('field_creation_popup_text');

    //     $path =  \Drupal::request()->getRequestUri();
    //     $destination = '?destination=' . $path;

    //     $popup = $field->value;
    //     $button1 = '<a class="btn btn--blue" href="/nl/user/login' . $destination . '" >Login</a>';
    //     $button2 = '<a class="btn btn--blue" href="/nl/user/register' . '">Register</a>';
    //     $popup .= '<br><br>' . '<p>' . $button1 . $button2 . '</p>';

    //     $variables['custom']['modal'] = $popup;
    //   }
    //   break;
    case 'page':
      if($node->id() == 376) {
        if(isset($_GET['f'])){
          $variables['custom']['flag'] = true;
        }
        $variables['#cache']['max-age'] = 0;
      }
      if(!$node->field_teaser_image->isEmpty()){
        $uri = $node->field_teaser_image->entity->field_media_image->entity->getFileUri();
        $image_url = ImageStyle::load('promoted_pattern')->buildUrl($uri);
        $variables['custom']['bg_image'] = $image_url;
      }
      break;
    case 'fabric':
      $relatedPatterns = \Drupal\block\Entity\Block::load('views_block__related_patterns_block_1');
      if($relatedPatterns) {
        $relatedPatternsView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($relatedPatterns);
        if($relatedPatternsView) {
          $variables['custom']['related_patterns'] = $relatedPatternsView;
        }
      }
      // views_block__stores_related_to_fabric_block_1
      $relatedStores = \Drupal\block\Entity\Block::load('views_block__stores_related_to_fabric_groups');
      if($relatedStores) {
        $relatedStoresView = \Drupal::entityTypeManager()->getViewBuilder('block')->view($relatedStores);
        if($relatedStoresView) {
          $variables['custom']['related_stores'] = $relatedStoresView;
        }
      }
      break;
  }

}
