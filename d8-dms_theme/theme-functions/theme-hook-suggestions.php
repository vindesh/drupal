<?php

/**
 * Implements hook_theme_suggestions_HOOK_alter() for page templates.
 * @param array $suggestions
 * @param array $variables
 */
function dms_theme_theme_suggestions_page_alter(array &$suggestions, array $variables) {
  $node = \Drupal::routeMatch()->getParameter('node');

  // If we are on a node page, add a template suggestion per node type.
  if (isset($node)) {
    $suggestions[] = 'page__node__' . $node->GetType();
  }
}

function dms_theme_theme_suggestions_paragraph_alter(array &$suggestions, array $variables) {
  /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
  $paragraph = $variables['elements']['#paragraph'];

  switch ($paragraph->getType()) {
    case 'block':
      // When we allow the client admin to pass arguments to the predefined view
      // and the admin has actually added parameters.
      if ($paragraph->hasField('field_block_params') && $paragraph->field_block_params->value) {
        $suggestions[] = 'paragraph__' . $paragraph->getType() . '__has_params';
        $suggestions[] = 'paragraph__' . $paragraph->getType() . '__has_params__' . $variables['elements']['#view_mode'];
      }
      break;
  }
}

/**
 * Implements hook_theme_suggestions_field_alter() to add field template suggestions.
 * @param array $suggestions
 * @param array $variables
 */
function dms_theme_theme_suggestions_field_alter(array &$suggestions, array $variables) {
  $field = $variables['element'];

  switch ($field['#field_type']) {
    case 'entity_reference_revisions':
      /** @var \Drupal\field\Entity\FieldConfig $fc */
      $fc = \Drupal\field\Entity\FieldConfig::loadByName($field['#entity_type'], $field['#bundle'], $field['#field_name']);
      // If we are dealing with Paragraphs as the ERR handler, add custom field template suggestion,
      // so that all Paragraphs fields output without extra wrappers, regardless of field name.
      if ($fc->getSetting('target_type') == 'paragraph') {
        $field_type_suggestion = array_shift($suggestions);
        array_unshift($suggestions, $field_type_suggestion, $field_type_suggestion . '__paragraph');
      }
      break;
  }
}

/**
 * Implements hook_theme_suggestions_HOOK_alter() for form templates.
 * @param array $suggestions
 * @param array $variables
 */
function dms_theme_theme_suggestions_form_alter(array &$suggestions, array $variables) {
  $form_id = $variables['element']['#form_id'];

  $suggestions[] = $variables['theme_hook_original'] . '__' . $form_id;
}

/**
 * Implements hook_theme_suggestions_HOOK_alter() to add view mode aware template suggestions
 * to taxonomy term twig templates. We rebuild the entire stack instead of trying to get our
 * suggestions in between existing ones:
 * taxonomy_term__VIEWMODE taxonomy_term__VOCABULARY taxonomy_term__VOCABULARY__VIEWMODE
 * taxonomy_term__TERMID taxonomy_term__TERMID__VIEWMODE
 * @param $suggestions
 * @param $variables
 */
function dms_theme_theme_suggestions_taxonomy_term_alter(&$suggestions, $variables) {
  $term = $variables['elements']['#taxonomy_term'];
  $view_mode = $variables['elements']['#view_mode'];

  $suggestions = ['taxonomy_term__' . $view_mode];
  $suggestions[] = 'taxonomy_term__' . $term->vid->target_id;
  $suggestions[] = 'taxonomy_term__' . $term->vid->target_id . '__' . $view_mode;
  $suggestions[] = 'taxonomy_term__' . $term->tid->value;
  $suggestions[] = 'taxonomy_term__' . $term->tid->value . '__' . $view_mode;
}

function dms_theme_theme_suggestions_user_alter(&$suggestions, $variables) {
  $view_mode = $variables['elements']['#view_mode'];

  $suggestions[] = $variables['theme_hook_original'] . '__' . $view_mode;
}
