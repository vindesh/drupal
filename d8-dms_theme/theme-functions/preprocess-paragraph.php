<?php

use Drupal\Core\Link;

/**
 * Additional classes for styling that apply to multiple paragraph types.
 * @param $variables
 */
function dms_theme_preprocess_paragraph(&$variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  if ($paragraph->hasField('field_background')) {
    $variables['custom']['extra_classes'][] = 'pg-bg--' . $paragraph->field_background->value;
    unset($variables['content']['field_background']);
  }
}


/**
 * Additional classes for layout styling the list items.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__list(&$variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  if (!$paragraph->field_grid_preference->isEmpty()) {
    $variables['custom']['extra_classes'][] = 'pg-gridcol--' . $paragraph->field_grid_preference->value;
    unset($variables['content']['field_grid_preference']);
  }
}


/**
 * Preprocessing the List Item paragraph bundle.
 * A list item can be rendered in three variations:
 *   - A simple block, with no link;
 *   - A clickable block with no explicit link title;
 *   - A simple block with explicit link title added,
 *     in which thumbnail, title and that link title
 *     are clickable.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__list_item(&$variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  // First determine if we need to add a link or not
  if (!$paragraph->field_list_item_link->isEmpty()) {
    try {
      /** @var Link $link */
      $link = $paragraph->field_list_item_link->get(0);
      $url = $link->getUrl();

      // Set some options for the link
      $link_options = [
        'attributes' => [
          'class' => [
            'pg-list-item__link',
          ],
        ]
      ];
      if ($url->isExternal()) {
        $link_options['attributes']['target'] = '_blank';
      }
      $url->setOptions($link_options);

      // Next determine if a custom link title was entered
      // Add an extra class to the URL object so we can differentiate this particular link in theming
      if (empty($link->title)) {
        $link_options['attributes']['class'][] = 'pg-list-item__link--block';
        $url->setOptions($link_options);
      } else {
        $link_title = $link->title;
        $link_options['attributes']['class'][] = 'pg-list-item__link--cart';
        $title_url = $link->getUrl();
        $title_url->setOptions($link_options);
      }
    } catch (\Drupal\Core\TypedData\Exception\MissingDataException $e) {
      \Drupal::logger('dms_theme')->notice($e);
    }
  }

  // If no link title was entered, build our simple content block.
  // In the end check if it needs wrapping in a link tag or not.
  if (!isset($link_title)) {
    $list_item = [];
    $list_item[] = $variables['content']['field_list_item_visual'];
    if (!$paragraph->field_list_item_title->isEmpty() ||
        !$paragraph->field_list_item_text->isEmpty()) {
      $list_item_body = [
        '#type' => 'container',
        '#attributes' => [
          'class' => 'pg-list-item__body'
        ],
      ];
      /*$list_item_body[] = $variables['content']['field_list_item_title'];
      $list_item_body[] = $variables['content']['field_list_item_text'];*/
      $list_item[] = $list_item_body;

      $list_item[] = $variables['content']['field_list_item_title'];

    }

    /**
    /// Technically the fromTextAndUrl method expects a string, but (for now?)
    /// it handles a render array just fine. In case this bricks in the future:
    /// render the array to markup, create a Markup object based on that string,
    /// pass this markup object as first argument to the fromTextAndUrl method.
        $rendered_item = render($list_item);
        $item_markup = \Drupal\Core\Render\Markup::create($rendered_item);
    */

    if (isset($url)) {
      $variables['custom']['list_item'] = Link::fromTextAndUrl($list_item, $url);
    } else {
      $variables['custom']['list_item'] = $list_item;
    }
  } else {
    $list_item = [];
    $list_item[] = Link::fromTextAndUrl([$variables['content']['field_list_item_visual'],$variables['content']['field_list_item_title']], $url)->toRenderable();
    if (!$paragraph->field_list_item_title->isEmpty() ||
      !$paragraph->field_list_item_text->isEmpty()) {
      $list_item_body = [
        '#type' => 'container',
        '#attributes' => [
          'class' => 'pg-list-item__body'
        ],
      ];

      if (!$paragraph->field_list_item_title->isEmpty()) {
        $list_item_body['title'] = Link::fromTextAndUrl(t("Details"), $url)
                            ->toRenderable();
        $list_item_body['title']['#weight'] = 0;
      }

      //$list_item_body['body'] = $variables['content']['field_list_item_text'];

      $list_item_body['more'] = Link::fromTextAndUrl($link_title, $title_url)->toRenderable();
      $list_item_body['more']['#weight'] = 50;

      $list_item[] = $list_item_body;


    }
    $variables['custom']['list_item'] = $list_item;
  }

}


/**
 * Preprocessing the Call to Action paragraph bundle to determine classes for styling.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__cta(&$variables) {
    /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
    $paragraph = $variables['elements']['#paragraph'];

    if ($paragraph->hasField('field_cta_style')) {
        $variables['custom']['extra_classes'][] = 'pg-cta--' . $paragraph->field_cta_style->value;
        unset($variables['content']['field_cta_style']);
    }
}


/**
 * Preprocessing the Text paragraph bundle to determine classes for column layout.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__text(&$variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  $variables['custom']['extra_classes'][] = 'pg-textcol--' . count($paragraph->field_text_columns);
}


/**
 * Preprocessing the Text & Project(s) paragraph bundle to determine classes for column layout.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__text_projects(&$variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  $variables['custom']['extra_classes'][] = 'pg-projects--' . count($paragraph->field_projects);
}


/**
 * Preprocessing the Text & Pattern(s) paragraph bundle to determine classes for column layout.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__text_patterns(&$variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  $variables['custom']['extra_classes'][] = 'pg-patterns--' . count($paragraph->field_patterns2);
}


/**
 * Preprocessing the Text & Media paragraph bundle to determine classes for layout.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__text_media(&$variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  // Add media alignment class.
  $variables['custom']['extra_classes'][] = 'pg--has-media-' . $paragraph->field_media_alignment->value;
  unset($variables['content']['field_media_alignment']);

  // Group the text fields into one output variable
  $variables['content']['text'] = [
    '#type' => 'container',
    '#attributes' => [
      'class' => 'pg-text-media__text',
    ],
  ];
  if (isset($variables['content']['field_title'])) {
    $variables['content']['text'][] = $variables['content']['field_title'];
    unset($variables['content']['field_title']);
  }
  if (isset($variables['content']['field_text'])) {
    $variables['content']['text'][] = $variables['content']['field_text'];
    unset($variables['content']['field_text']);
  }

  // Group the media fields into one output variable
  $variables['content']['media'] = [
    '#type' => 'container',
    '#attributes' => [
      'class' => 'pg-text-media__media',
    ],
  ];
  if (isset($variables['content']['field_media'])) {
    $variables['content']['media'][] = $variables['content']['field_media'];
    unset($variables['content']['field_media']);
  }
}


/**
 * Preprocessing the Image Gallery paragraph bundle to add libaries.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__image_gallery(&$variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  $variables['#attached']['library'][] = 'dms_theme/slick';
  // $variables['#attached']['library'][] = 'dms_theme/tinyslider';
  // $variables['#attached']['library'][] = 'dms_theme/flickity';
}


/**
 * Preprocessing the "Block embed" paragraph type.
 * Only needed if we want to allow arguments to be passed to the predefined view.
 * When there is no option to provide arguments, simply use the Display settings on the embed field
 * inside the Paragraph type.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__block__has_params(&$variables) {
  // Core bug: View and Display names are separated by a single underscore,
  // not a double underscore which makes it impossible to know where one ends and
  // the other begins if either or both of the names have spaces in them.

  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  /** @var \Drupal\block\Entity\Block $block */
  $block = $variables['content']['field_block_embed']['#items'][0]->entity;
  $block_plugin_id = $block->getPluginId();

  // Use the plugin ID (views_block:view_name-display) to retrieve the
  // system names of our separate components in a reliable manner.
  $block_plugin_id_fragments = explode(':', $block_plugin_id);
  $view_id_fragments = explode('-', $block_plugin_id_fragments[1]);

  if ($paragraph->field_block_params->value) {
    $block_params = $paragraph->field_block_params->value;
    unset($variables['content']['field_block_params']);
  } else {
    $block_params = "";
  }

  if ($view_ra = views_embed_view($view_id_fragments[0], $view_id_fragments[1], $block_params)) {
    $variables['content']['custom_block_embed'] = $view_ra;
    $variables['content']['custom_block_embed']['#weight'] = 50;
  }
}


/**
 * Preprocessing the Blog Categories paragraph bundle to add libaries.
 * @param $variables
 */
function dms_theme_preprocess_paragraph__overview_block(&$variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  $variables['custom']['extra_classes'][] = 'pg-references--' . count($paragraph->field_references);
}
