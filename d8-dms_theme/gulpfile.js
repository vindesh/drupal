/*  Define the variables needed throughout this file
==============================================================================*/
var projectURL        = 'http://fibremood.mewh.local';
var criticalCssPage   = projectURL;

var sourceCSS         = 'src/styles/**/*.scss';
var sourceJS          = 'src/scripts/**/*.js';
var sourceIMG         = 'src/images/**/*';
var twig              = 'templates/**/*.twig';
var yml               = '**/*.yml';
var php               = '**/*.php';
var breakpointOptions = {
  map: true,                          // output breakpoints as a Sass map
  mapName: 'mq-breakpoints',          // name of the Sass map
  vars: false,                        // output breakpoints as variables
  varsPrefix: ''                      // prefix for the variables
};

/* ------------- WARNING!! ------------- */
/* --- DO NOT EDIT BEYOND THIS POINT --- */
/* ------- http://bit.ly/2xyQEQp ------- */



/*  Define the used addons
==============================================================================*/
var gulp              = require('gulp');
var sass              = require('gulp-sass');
var sourcemaps        = require('gulp-sourcemaps');
var autoprefixer      = require('gulp-autoprefixer');
var minifyJS          = require('gulp-uglify');
var minifyCSS         = require('gulp-clean-css');
var minifyIMAGES      = require('gulp-imagemin');
// var concat        = require('gulp-concat');
var plumber           = require('gulp-plumber');
var sassGlob          = require('gulp-sass-glob');
var criticalCss       = require('gulp-penthouse');
var browserSync       = require('browser-sync').create();
var cp                = require('child_process');
var rename            = require('gulp-rename');
var drupalBreakpoints = require('drupal-breakpoints-scss');
var $                 = require('gulp-load-plugins')();
var runsequence       = require('run-sequence');
var log               = require('fancy-log');

var onError = function (err) {
  console.log(err.toString());
  this.emit('end');
};



/*  STYLES / CSS
==============================================================================*/
gulp.task('styles', function() {

  return gulp.src(sourceCSS)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sassGlob())
    .pipe(sourcemaps.init())
    // .pipe(sass().on('error', sass.logError))
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 3 versions', 'ie >= 10'],
      cascade: false
    }))
    .pipe(minifyCSS())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./css'))
    .pipe(browserSync.stream({match: '**/*.css'}));

});



/*  STYLES / CSS
==============================================================================*/
gulp.task('breakpoints', function() {
  return gulp.src('./dms_theme.breakpoints.yml')
    .pipe(drupalBreakpoints.ymlToScss(breakpointOptions))
    .pipe(rename('_breakpoints.scss'))
    .pipe(gulp.dest('./src/styles/config'))
});



/*  SCRIPTS / JS
==============================================================================*/
gulp.task('scripts', function() {

  return gulp.src(sourceJS)
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sourcemaps.init())
    .pipe(minifyJS())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./js')) // was 'js'
    .pipe(browserSync.reload({
      stream: true
    }));

});



/*  IMAGES / IMG
==============================================================================*/
gulp.task('images', function() {

  return gulp.src(sourceIMG)
    .pipe(minifyIMAGES())
    .pipe(gulp.dest('./img'));

});



/*  BROWSERSYNC
==============================================================================*/
gulp.task('browserSync', function() {

  browserSync.init({
    proxy: projectURL
  });

});



/*  CR / CACHE REBUILD / CLEAR CACHE
==============================================================================*/
// gulp.task('clearcache', function(done) {
//
//   return cp.spawn('drush', ['cache-rebuild'], {stdio: 'inherit'})
//   .on('close', done);
//
// });
//
// gulp.task('reload', ['clearcache'], function() {
//
//   browserSync.reload();
//
// });



/*  PENTHOUSE / CRITICAL
==============================================================================*/
gulp.task('penthouse', function() {

  return gulp.src('./css/styles.css')
    .pipe(criticalCss({
      out: 'critical.css',
      url: 'https://www.victoriginals.com',
      width: 1920,
      height: 1080,
      strict: true,
      timeout: 10000,
      userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
    }))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./css'));

});

// // https://github.com/pocketjoso/penthouse/issues/110#issuecomment-198890121
// var urls = [
//   projectURL,
//   projectURL + '/importantpage'
// ];
// function penthouseUrls(urls). {
//   penthouse({
//     url: urls.shift(),
//     out: 'critical.css',
//     width: 1920,
//     height: 1080,
//     strict: true,
//     timeout: 60000,
//     userAgent: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
//   }, function(err, criticalCSS) {
//     if(err) {
//       console.log(err);
//     }
//     console.log('finished');
//     if(urls.length !== 0) {
//       penthouseUrls(urls)
//     }
//   });
// }
// penthouseUrls(urls);



/*  DEFAULT TASK
==============================================================================*/
gulp.task('default', ['browserSync', 'styles'],function() {

  gulp.watch([sourceCSS], ['styles']);
  gulp.watch([sourceJS], ['scripts']);
  gulp.watch(twig, function(event) {
    if (event.type === 'changed') {
      log.info('Template ' + event.path + ' was changed. Reloading page.');
      browserSync.reload();
    } else if (event.type === 'added') {
      log.info('New template found. Clearing theme registry cache.');
      runsequence('cctheme');
    }
  });
  gulp.watch(yml, function(event) {
    if (event.type === 'changed') {
      log.info('Yaml configuration in ' + event.path + ' changed.');
      // If the changed file was our breakpoints config, dynamically
      // rebuild our Sass map for theming.
      if (event.path.indexOf('.breakpoints.yml') !== -1) {
        log.info('Scanning theme breakpoints configuration for changes... Writing Sass variables.')
        runsequence('breakpoints');
      }
    } else if (event.type === 'added') {
      log.info('New Yaml configuration found. Rebuilding cache.');
    }
    // When config was changed, have to rebuild the cache.
    runsequence('cr');
  });

});



/*  RUN DRUSH THROUGH GULP
==============================================================================*/
gulp.task('cctheme', function() {
  return gulp.src('', { read: false})
    .pipe($.shell(['drush cc theme-registry']));
});

gulp.task('cr', function() {
  return gulp.src('', { read: false})
    .pipe($.shell(['drush cr']));
});



/*  PRODUCTION TASK
==============================================================================*/
gulp.task('production', function() {

  gulp.start('penthouse','images');

});



/*  CREDITS
==============================================================================*/
// https://www.chenhuijing.com/blog/drupal-101-theming-with-gulp-again/#
