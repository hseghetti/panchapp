// declarations, dependencies
// ----------------------------------------------------------------------------
var gulp = require('gulp');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var livereload = require('gulp-livereload');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var gutil = require('gulp-util');
var babelify = require('babelify');
var nodemon = require('gulp-nodemon');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');

// External dependencies you do not want to rebundle while developing,
// but include in your application deployment
var dependencies = [
	'react',
  'react-dom'
];
// keep a count of the times a task refires
var scriptsCount = 0;

// Gulp tasks
// ----------------------------------------------------------------------------
gulp.task('scripts', function () {
    bundleApp(false);
});

gulp.task('deploy', function (){
	bundleApp(true);
});

gulp.task('watch', function () {
	gulp.watch(['app/**/*.js'], ['scripts', browserSync.reload]);
	gulp.watch('app/**/*.scss', ['sass']);
	gulp.watch('app/*.html', browserSync.reload);
	//gulp.watch('app/**/*.js', browserSync.reload);
});

// When running 'gulp' on the terminal this task will fire.
// It will start watching for changes in every .js file.
// If there's a change, the task 'scripts' defined above will fire.
gulp.task('default', ['scripts','sass', 'html', 'watch', 'start-server']);

gulp.task('html', function () {
	return gulp.src('app/templates/*.html')
		.pipe(gulp.dest('./public/'));
});

gulp.task('start-server', function (cb) {
  nodemon({
      watch: ['./server/**/*', 'server.js'],
      script: 'server.js'
  })

	livereload.listen(35729)

  return cb();
});

gulp.task('sass', function () {
	return gulp.src('app/*.scss')
	.pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(concat('main.css'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./public/css'))
	.pipe(browserSync.stream());
});

gulp.task('browserSync', function () {
	browserSync.init({
		server: {
			baseDir: '.'
		}
	});
});

// Private Functions
// ----------------------------------------------------------------------------
function bundleApp(isProduction) {
	scriptsCount++;
	// Browserify will bundle all our js files together in to one and will let
	// us use modules in the front end.
	var appBundler = browserify({
    	entries: './app/main.js',
    	debug: true
  	})

	// If it's not for production, a separate vendors.js file will be created
	// the first time gulp is run so that we don't have to rebundle things like
	// react everytime there's a change in the js file
  	if (!isProduction && scriptsCount === 1){
  		// create vendors.js for dev environment.
  		browserify({
				require: dependencies,
				debug: true
		})
			.bundle()
			.on('error', gutil.log)
			.pipe(source('vendors.js'))
			.pipe(gulp.dest('./public/js/'));
  	}
  	if (!isProduction){
  		// make the dependencies external so they dont get bundled by the
		// app bundler. Dependencies are already bundled in vendor.js for
		// development environments.
  		dependencies.forEach(function(dep){
  			appBundler.external(dep);
  		})
  	}

  	appBundler
  		// transform ES6 and JSX to ES5 with babelify
	  	.transform("babelify", {presets: ["es2015", "react"]})
	    .bundle()
	    .on('error',gutil.log)
	    .pipe(source('bundle.js'))
	    .pipe(gulp.dest('./public/js/'));
}
