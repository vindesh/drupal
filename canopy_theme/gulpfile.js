/*
gulpfile.js
===========
Rather than manage one giant configuration file responsible
for creating multiple tasks, each task has been broken out into
its own file in gulp/tasks. Any files in that directory get
automatically required below.

To add a new task, simply add a new task file that directory.
gulp/tasks/default.js specifies the default set of tasks to run
when you run `gulp`.
*/
'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');
const path = require('path');
const browserSync = require('browser-sync');
const webpack = require('webpack');
const gutil = require('gulp-util');
const bs = require('browser-sync').create();
const ttf2woff2 = require('gulp-ttf2woff2');
const ttf2woff = require('gulp-ttf2woff');
const webpackConfig = require('./webpack.config.js');
const webpackConfig_dev = require('./webpack.config.dev.js');

const compileScript = (callback) => {
  // COMPILE SCRIPT;
  return webpack(webpackConfig, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack:build-run', err);
    }
    gutil.log('[webpack:build-run]', stats.toString({
      colors: true
    }));
    callback();
  });
};
const compileDevScript = (callback) => {
  // COMPILE SCRIPT;
  return webpack(webpackConfig_dev, function (err, stats) {
    if (err) {
      throw new gutil.PluginError('webpack:build-run', err);
    }
    gutil.log('[webpack:build-run]', stats.toString({
      colors: true
    }));
    callback();
  });
};

const compileTtfFonts = () => {
  // Convert TTF fonts to WOFF and WOFF2;
  return gulp.src(['./app/fonts/Source_Sans_Pro/*.ttf'])
  .pipe(ttf2woff2({'clone': true}))
  .pipe(ttf2woff({'clone': true}))
  .pipe(gulp.dest('./build/fonts/Source_Sans_Pro'));
};

const compileStyle = () => {
  // COMPILE STYLE;
  return gulp.src('./app/styles/ukg.less')
  .pipe(sourcemaps.init())
  .pipe(less({
    paths: [path.join(__dirname, 'less', 'includes')]
  }))
  .pipe(sourcemaps.write('./maps'))
  .pipe(gulp.dest('./build/css'))
  .pipe(bs.reload({stream: true}));
};

const cleanJs = () => {
  return gulp.src('./build/scripts', {read: false, allowEmpty: true})
  .pipe(clean());
};

gulp.task('fonts', gulp.series(compileTtfFonts));
gulp.task('js', gulp.series(cleanJs, compileScript));
gulp.task('dev-js', gulp.series(cleanJs, compileDevScript));
gulp.task('css', gulp.series(compileStyle));
gulp.task('watch', function () {
  browserSync.init({
    server: "./"
  });
  gulp.watch('app/scripts/**/*.js', gulp.parallel('dev-js'));
  gulp.watch('app/styles/**/*.less', gulp.parallel('css'));
});
gulp.task('watch-components', function () {
  browserSync.init({
    server: "./",
    index: "components.html"
  });
  gulp.watch('app/scripts/**/*.js', gulp.parallel('dev-js'));
  gulp.watch('app/styles/**/*.less', gulp.parallel('css'));
  gulp.watch("components.html").on('change', browserSync.reload);
});
gulp.task('watch-home', function () {
  browserSync.init({
    server: "./",
    index: "home.html"
  });
  gulp.watch('app/scripts/**/*.js', gulp.parallel('dev-js'));
  gulp.watch('app/styles/**/*.less', gulp.parallel('css'));
  gulp.watch("home.html").on('change', browserSync.reload);
});
gulp.task('watch-site', function () {
  browserSync.init({
    server: "./"
  });
  gulp.watch('app/scripts/**/*.js', gulp.parallel('js'));
  gulp.watch('app/styles/**/*.less', gulp.parallel('css'));
});
gulp.task('default', gulp.series(gulp.parallel('fonts', 'css', 'dev-js'), 'watch'));
gulp.task('build', gulp.parallel('fonts', 'css', 'js'));
gulp.task('components', gulp.series(gulp.parallel('fonts', 'css', 'dev-js'), 'watch-components'));
gulp.task('home', gulp.series(gulp.parallel('fonts', 'css', 'dev-js'), 'watch-home'));
gulp.task('drupal', gulp.series(gulp.parallel('css', 'js'), 'watch-site'));
