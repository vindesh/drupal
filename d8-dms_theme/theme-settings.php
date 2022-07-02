<?php

/**
 * @file
 * Contains the theme's settings form.
 */

use Drupal\Core\Form\FormStateInterface;

/**
 * Implements hook_form_system_theme_settings_alter().
 */
function dms_theme_form_system_theme_settings_alter(&$form, FormStateInterface &$form_state, $form_id = NULL) {
  // Work-around for a core bug affecting admin themes. See issue #943212.
  if (isset($form_id)) {
    return;
  }

  $form['options_settings'] = [
    '#type' => 'details',
    '#open' => 'open',
    '#title' => t('DMS Theme Settings'),
    '#weight' => 0,
  ];

  $form['options_settings']['breakpoint_labels'] = [
    '#type' => 'details',
    '#open' => 'open',
    '#title' => t('Breakpoint Labels'),
    '#description' => t('Checking this box will show breakpoint labels in the lower right corner.'),
    '#description_display' => 'before',
  ];

  $form['options_settings']['breakpoint_labels']['breakpoints'] = [
    '#type'           => 'checkbox',
    '#title'          => t('Enable breakpoint labels for theme'),
    '#default_value'  => theme_get_setting('breakpoints'),
  ];

  $form['options_settings']['mobile_menu'] = [
    '#type' => 'details',
    '#open' => 'open',
    '#title' => t('Mobile Menu Position'),
    '#description' => t('Select where the mobile menu should come from or if this theme uses a custom solution.'),
    '#description_display' => 'before',
  ];

  $form['options_settings']['mobile_menu']['mm_position'] = [
    '#type' => 'select',
    '#options' => [
      'none' => '- Custom -',
      'top' => 'Top',
      'left' => 'Left',
      'right' => 'Right',
    ],
    '#default_value'  => theme_get_setting('mm_position'),
  ];

  $form['favicon']['settings']['#weight'] = 20;

  $form['favicon']['favicon_upgrade_default'] = [
    '#type' => 'checkbox',
    '#title' => t('Upgrade favicon to multi-platform app tiles'),
    '#default_value' => theme_get_setting('favicon_upgrade_default'),
    '#states' => [
      'disabled' => [
        'input[name="default_favicon"]' => [
          'checked' => false,
        ],
      ],
    ],
  ];
}
