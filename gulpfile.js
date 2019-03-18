const gulp = require('gulp');
const rename = require('gulp-rename');
const babelify = require('babelify');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const connectPHP = require('gulp-connect-php7');
const browserSync = require("browser-sync");
const postcssPresetEnv = require('postcss-preset-env');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const jsSources = ['script/src/**/*.js']
	  jsEntry = 'script/src/script.js',
	  cssSources = ['style/src/**/*.css'],
	  outputDir = 'public/dist';

gulp.task('buildCSS', function() {
	const plugins = [
		autoprefixer({browsers: ['last 1 version']}),
		cssnano(),
		postcssPresetEnv()
	];
	return gulp.src(cssSources, { sourcemaps: true })
		.pipe(postcss(plugins))
		.pipe(concat('style.min.css'))
		.pipe(gulp.dest(outputDir, { sourcemaps: true }))
		.pipe(browserSync.stream())
});

gulp.task('buildJS', function() {
	return browserify({
			debug: true,
			entries: [jsEntry]
		})
		.transform(babelify, { presets: ['@babel/env'] })
		.bundle()
		.pipe(source('app.js'))
		.pipe(rename({ extname: '.min.js' }))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		//.pipe(uglify())
		.pipe(sourcemaps.write('/.'))
		.pipe(gulp.dest(outputDir))
		.pipe(browserSync.stream())
});

gulp.task('watch', function() {
	gulp.watch(cssSources, gulp.series(['buildCSS']));
	gulp.watch(jsSources, gulp.series(['buildJS']));
});

gulp.task('connect', function() {
	connectPHP.server({
		base: './public',
		keepalive: true,
		hostname: '127.0.0.1',
		port: 8000,
		open: false
	}, function() {
		browserSync({
			proxy: '127.0.0.1:8000',
			port: 8080,
			open: true,
			notify: false
		});
	})
});

gulp.task('disconnect', function() {
	connectPHP.closeServer();
});

gulp.task('build', gulp.parallel(['buildCSS', 'buildJS']));
gulp.task('default', gulp.parallel([gulp.series(['connect', 'disconnect']), gulp.series(['build', 'watch'])]));