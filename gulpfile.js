var gulp 				= require('gulp');
var clean 			= require('gulp-clean');
var mocha 			= require('gulp-mocha');
var ts 					= require('gulp-typescript');
var tdoc 				= require("gulp-typedoc");
var webpack 		= require('webpack-stream');
var uglify 			= require('gulp-uglify');
var rename 			= require('gulp-rename');
var istanbul 		= require('gulp-istanbul');


//----------------------------
// PATHS
//----------------------------
var paths = {
	javascripts: ['src/**/*.js', 'test/**/*.js'],
	typescripts: ['src/**/*.ts', 'test/**/*.ts'],
	testsources: ['src/**/*.js'],
	typesources: ['src/**/*.ts'],
	distsources: ['src/**/*.ts'],
	clean: ['src/**/*.js', 'test/**/*.js', 'test/io/test_output/*', 'build', 'dist', 'docs', 'build'],
	tests: ['test/**/*.js']
};


//----------------------------
// TASKS
//----------------------------
gulp.task('build', ['clean'], function () {
	return gulp.src(paths.typescripts, {base: "."})
						 .pipe(ts({
							 target: "ES5",
							 module: "commonjs",
							 removeComments: true
						 }))
						.pipe(gulp.dest('.'));
});


// Packaging - Node / Commonjs
gulp.task('dist', ['tdoc'], function () {
	return gulp.src(paths.distsources)
						 .pipe(ts({
							 target: "ES5",
							 module: "commonjs",
							 removeComments: true
						 }))
						 .pipe(gulp.dest('dist'));
});


// Packaging - Webpack
gulp.task('pack', ['dist'], function() {
	return gulp.src('./index.js')
		.pipe(webpack( require('./webpack.config.js') ))
		.pipe(gulp.dest('build/'));
});


// Uglification...
gulp.task('bundle', ['pack'], function() {
	return gulp.src('build/anonymization.js')
		.pipe(uglify())
		.pipe(rename('anonymization.min.js'))
		.pipe(gulp.dest('build'));
});


// Documentation (type doc)
gulp.task("tdoc", ['clean'], function() {
    return gulp
        .src(paths.typesources)
        .pipe(tdoc({
            module: "commonjs",
            target: "es5",
            out: "docs/",
            name: "Graphinius"//,
						// theme: "minimal"
        }));
});


gulp.task('test', ['build'], function () {
	return gulp.src(paths.tests, {read: false})
						 .pipe(mocha({reporter: 'dot',
						 							timeout: Number.POSITIVE_INFINITY}));
});


gulp.task('pre-cov-test', ['build'], function () {
  return gulp.src(paths.testsources)
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});


gulp.task('coverage', ['pre-cov-test'], function () {
  return gulp.src(paths.tests)
    .pipe(mocha({reporter: 'dot',
						 		 timeout: Number.POSITIVE_INFINITY}))
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    // .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});


gulp.task('clean', function () {
	return gulp.src(paths.clean, {read: false})
						 .pipe(clean());
});


gulp.task('watch', function () {
	gulp.watch(paths.typescripts, ['test']);
});


gulp.task('default', ['watch']);
