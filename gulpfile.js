var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify-es').default;

gulp.task('js-min', function(){
    return gulp.src(['js-organismo/*.js'])
        .pipe(gp_concat('concat.js'))
        .pipe(gulp.dest('build'))
        .pipe(gp_rename('organismo.min.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('js-libs'));
});


gulp.task('default', function(){ gulp.start('js-min');});