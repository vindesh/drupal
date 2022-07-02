<?php

function dms_theme_preprocess_html(&$variables) {
  $themePath = '/' . drupal_get_path('theme', 'dms_theme');

  // Sidebars
  if (!empty($variables['page']['sidebar_first']) && !empty($variables['page']['sidebar_second'])) {
    $variables['attributes']['class'][] = 'two-sidebars';
  }
  elseif (!empty($variables['page']['sidebar_first'])) {
    $variables['attributes']['class'][] = 'one-sidebar';
    $variables['attributes']['class'][] = 'sidebar-first';
  }
  elseif (!empty($variables['page']['sidebar_second'])) {
    $variables['attributes']['class'][] = 'one-sidebar';
    $variables['attributes']['class'][] = 'sidebar-second';
  }
  else {
    $variables['attributes']['class'][] = 'no-sidebars';
  }

  // Front
  $variables['attributes']['class'][] = \Drupal::service('path.matcher')
    ->isFrontPage() ? 'front' : 'not-front';

  // Language
  $variables['attributes']['class'][] = 'lang-' . \Drupal::languageManager()->getCurrentLanguage()->getId();

  // Logged in/out
  $variables['attributes']['class'][] = $variables['logged_in'] ? 'logged-in' : 'logged-out';

  $path = \Drupal::service('path.current')->getPath();
  $pathArgs = explode('/',$path);

  // Path
  if(!empty($pathArgs[1])) {
    // $variables['attributes']['class'][] = Html::cleanCssIdentifier('path-' . $path[1]);
    $variables['attributes']['class'][] = 'path-' . $pathArgs[1];
  }

  // Node
  // Node: type
  $variables['attributes']['class'][] = isset($variables['node_type']) ? 'node-type-' . $variables['node_type'] : '';
  // Node: id
  if(!empty($pathArgs[1]) && !empty($pathArgs[2]) && ($pathArgs[1] == 'node') && (is_numeric($pathArgs[2]))) {
    $variables['attributes']['class'][] = 'node-id-' . $pathArgs[2];
  }

  // Commerce
  if($pathArgs[1] == 'product') {
    $variables['attributes']['class'][] = 'node-type-product';
  }

  // Taxonomy
  if(!empty($pathArgs[1] && !empty($pathArgs[2])) && !empty($pathArgs[3]) && ($pathArgs[1] == 'taxonomy') && (is_numeric($pathArgs[3]))) {
    $variables['attributes']['class'][] = 'taxonomy-term';
    $variables['attributes']['class'][] = 'taxonomy-term-' . $pathArgs[3];
  }

  // Breakpoint labels
  $breakpoints = theme_get_setting('breakpoints');
  if (\Drupal::service('module_handler')->moduleExists('dms_environment')) {
    if (\Drupal::service('dms_environment.service')->getCurrent() == 'development' && $breakpoints == 1) {
      $variables['attributes']['class'][] = 'breakpoint-labels';
    }
  }

  // Mobile menu
  $mobilePosition = theme_get_setting('mm_position');
  if(!empty($mobilePosition)) {
    $variables['attributes']['class'][] = 'mm-' . $mobilePosition;
  }

  // Critical CSS
  if (\Drupal::service('module_handler')->moduleExists('dms_environment')) {
    if (\Drupal::service('dms_environment.service')->getCurrent() == 'production') {
      if (file_exists(\Drupal::theme()->getActiveTheme()->getPath() . '/css/critical.css')) {
        $critical = file_get_contents(\Drupal::theme()->getActiveTheme()->getPath() . '/css/critical.css');
        $criticalCss = [
          '#tag' => 'style',
          '#value' => $critical,
          '#weight' => -9999,
        ];
        $variables['page']['#attached']['html_head'][] = [$criticalCss, 'critical-css'];
      }
    }
  }

  // https://css-tricks.com/the-current-state-of-telephone-links/
  // <meta name="format-detection" content="telephone=no">
  $formatDetection = [
    '#tag' => 'meta',
    '#attributes' => [
      'name' => 'format-detection',
      'content' => 'telephone=no'
    ]
  ];
  $variables['page']['#attached']['html_head'][] = [$formatDetection, 'format-detection'];

  // Favicons: either plain favicon.ico or improved with app manifest for iOS, Android, Win10
  $favicon_default = theme_get_setting('favicon.use_default');
  $favicon_deluxe = theme_get_setting('favicon_upgrade_default');

  if ($favicon_default && $favicon_deluxe) {
    // Head elements for fav icons.
    $favAppleTouch = [
      '#tag' => 'link',
      '#attributes' => [
        'rel' => 'apple-touch-icon',
        'sizes' => '180x180',
        'href' => $themePath . '/img/fav/apple-touch-icon.png',
      ],
    ];
    $fav32 = [
      '#tag' => 'link',
      '#attributes' => [
        'rel' => 'icon',
        'type' => 'image/png',
        'sizes' => '32x32',
        'href' => $themePath . '/img/fav/favicon-32x32.png',
      ],
    ];
    $fav16 = [
      '#tag' => 'link',
      '#attributes' => [
        'rel' => 'icon',
        'type' => 'image/png',
        'sizes' => '16x16',
        'href' => $themePath . '/img/fav/favicon-16x16.png',
      ],
    ];
    $favManifest = [
      '#tag' => 'link',
      '#attributes' => [
        'rel' => 'manifest',
        'href' => $themePath . '/img/fav/site.webmanifest',
      ],
    ];
    $favSafariTab = [
      '#tag' => 'link',
      '#attributes' => [
        'rel' => 'mask-icon',
        'color' => '#666666',
        'href' => $themePath . '/img/fav/safari-pinned-tab.svg',
      ],
    ];
    $favShortcut = [
      '#tag' => 'link',
      '#attributes' => [
        'rel' => 'shortcut icon',
        'href' => $themePath . '/img/fav/favicon.ico',
      ],
    ];
    $favMicrosoftApp = [
      '#tag' => 'meta',
      '#attributes' => [
        'name' => 'msapplication-config',
        'content' => $themePath . '/img/fav/browserconfig.xml',
      ],
    ];
    $favThemeColor = [
      '#tag' => 'meta',
      '#attributes' => [
        'name' => 'theme-color',
        'content' => '#ffffff',
      ],
    ];

    // Remove the favicon set by core if still present
    if (isset($variables['page']['#attached']['html_head_link'])) {
      foreach ($variables['page']['#attached']['html_head_link'] as $key => $headlinks) {
        foreach ($headlinks as $index => $headlink) {
          if ($headlink['rel'] == 'shortcut icon') {
            unset($variables['page']['#attached']['html_head_link'][$key][$index]);
            if (empty($variables['page']['#attached']['html_head_link'][$key])) {
              unset($variables['page']['#attached']['html_head_link'][$key]);
            }
          }
        }
      }
    }
    $variables['page']['#attached']['html_head'][] = [$favAppleTouch, 'apple-touch-icon'];
    $variables['page']['#attached']['html_head'][] = [$fav32, 'favicon-32px'];
    $variables['page']['#attached']['html_head'][] = [$fav16, 'favicon-16px'];
    $variables['page']['#attached']['html_head'][] = [$favManifest, 'favicon-manifest'];
    $variables['page']['#attached']['html_head'][] = [$favSafariTab, 'favicon-safari-tab'];
    $variables['page']['#attached']['html_head'][] = [$favShortcut, 'favicon-shortcut'];
    $variables['page']['#attached']['html_head'][] = [$favMicrosoftApp, 'msapplication-config'];
    $variables['page']['#attached']['html_head'][] = [$favThemeColor, 'theme-color'];
  }

}
