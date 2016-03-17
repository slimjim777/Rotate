'use strict';

var gulp = require('gulp');
var react = require('gulp-react');
var browserify = require('gulp-browserify');
var babel = require("gulp-babel");
var open = require('gulp-open');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var shell = require('gulp-shell');
var runSequence = require('run-sequence');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');

var path = {
    NODE: 'node_modules/',
    MEDIA: 'schedule/static/media/',
    SRC: 'react/',
    BUILD: 'build/',
    BUILD_FILE: 'bundle.js',
    DIST: 'schedule/static/media/dist/'
};

// Compile the JSX files to Javascript in the build directory
gulp.task('compile_jsx', function(){
    return gulp.src(path.SRC + '*.js')
        .pipe(babel())
        .pipe(gulp.dest(path.BUILD));
});

gulp.task('compile_jsx_components', function(){
    return gulp.src(path.SRC + 'components/*.js')
        .pipe(babel())
        .pipe(gulp.dest(path.BUILD + 'components'));
});

gulp.task('compile_jsx_models', function(){
    return gulp.src(path.SRC + 'models/*.js')
        //.pipe(babel())
        .pipe(gulp.dest(path.BUILD + 'models'));
});

gulp.task('minify-css', function() {
    return gulp.src(path.MEDIA + 'css/app.css')
        .pipe(minifyCss())
        .pipe(gulp.dest(path.MEDIA + 'css/dist/'));
});

gulp.task('minify-pikaday', function() {
    return gulp.src(path.NODE + 'react-pikaday/node_modules/pikaday/css/pikaday.css')
        .pipe(minifyCss())
        .pipe(gulp.dest(path.MEDIA + 'css/dist/'));
});

// Concatenate and minimise the Javascript files and copy to dist folder
// (This has two other tasks as dependencies, which will finish first)
gulp.task('build_components', ['compile_jsx', 'compile_jsx_components', 'compile_jsx_models'], function(){
    return gulp.src([path.BUILD + 'app.js'])
        .pipe(browserify({}))
        .on('prebundle', function(bundler) {
            // Make React available externally for dev tools
            bundler.require('react');
        })
        .pipe(rename('bundle.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.DIST));
});

gulp.task('watch', function () {
    runSequence('build_components');
    gulp.watch([path.SRC + '**/*.js'], ['build_components']);
});

// Default: remember that these tasks get run asynchronously
gulp.task('default', ['build_components', 'minify-css', 'minify-pikaday']);
