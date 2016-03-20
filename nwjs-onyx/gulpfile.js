'use strict';

var
	gulp = require('gulp'),
	path = require('path'),
	fs = require('fs'),
	cp = require('child_process'),
	jshint = require('gulp-jshint'),
	stylish = require('jshint-stylish'),
	NwBuilder = require('nw-builder');

/**
 * Gulp Tasks:
 *
 * 'init' - Fetches the enyo libraries via enyo-dev
 * 'enyo' - Builds the app with enyo-dev
 * 'nwjs' - Packages built app with nwjs for the current platform 
 * 'nwjs-all' - Packages built app with nwjs for all available platforms
 * 'run' - Runs the built app directly with nwjs without packaging
 * 'build' - Combination of the 'enyo' task then the 'nwjs' task
 * 'build-all' - Combination of the 'enyo' task then the 'nwjs-all' task
 *
 * The default task is 'build'
 */

gulp.task('default', ['build']);
gulp.task('init', init);
gulp.task('enyo', enyo);
gulp.task('nwjs', nwjs);
gulp.task('nwjs-all', nwjsAll);
gulp.task('build', build);
gulp.task('build-all', buildAll);
gulp.task('run', run);
gulp.task('jshint', lint);

// Gulp Task: 'init'
function init(cb) {
	exec('enyo init', cb);
}

// Gulp Task: 'build'
function build(cb) {
	enyo(function() {
		nwjs(cb);
	});
}

// Gulp Task: 'build-all'
function buildAll(cb) {
	enyo(function() {
		nwjsAll(cb);
	});
}

// Gulp Task: 'enyo'
function enyo(cb) {
	var opts = process.argv.slice(2);
	if((opts.length > 0) && (opts[0].indexOf('-')!==0)) {
		opts = opts.slice(1);
	}
	opts = opts.map(function (v) { return v.match(/^[^\s-]+?\s+[^\s]/g) ? ('"' + v + '"') : v; })
			.map(function (v) { return v.replace(/=((?=[^\s'"]+\s)[^'"]*$)/g, '="$1"'); });
	console.log('Building Enyo app at ' + process.cwd() + '...');
	exec('enyo pack ' + opts.join(' '), cb);
}

// Gulp Task: 'nwjs'
function nwjs(cb) {
	nwbuild([getCurrentPlatform()], 'build', cb);
}

// Gulp Task: 'nwjs-all'
function nwjsAll(cb) {
	nwbuild(['osx32', 'osx64', 'win32', 'win64', 'linux32', 'linux64'], 'build', cb);
}

// Gulp Task: 'run'
function run(cb) {
	nwbuild([getCurrentPlatform()], 'run', cb);
}

// Gulp Task: 'jshint'
function lint() {
	return gulp
		.src(['./**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter(stylish, {verbose: true}))
		.pipe(jshint.reporter('fail'));
}

function nwbuild(platforms, action, callback) {
	var pkg = JSON.parse(fs.readFileSync('./package.json', {encoding:'utf8'}));
	var cfg = {};
	if(exists('./enyoconfig')) {
		cfg = JSON.stringify(fs.readFileSync('./enyoconfig', {encoding:'utf8'}));
	}
	pkg['main'] = 'index.html';
	pkg['window'] = pkg['window'] || {};
	if(cfg.title) {
		pkg['window'].title = cfg.title;
	}
	if(process.argv.indexOf('-P')>-1 || process.argv.indexOf('--production')>-1 || cfg.production) {
		pkg['window'].toolbar = false;
	}
	fs.writeFileSync('./dist/package.json', JSON.stringify(pkg, null, '\t'), {encoding:'utf8'});
	console.log('Packaging with nwjs to ' + path.join(process.cwd(), 'bin') + '...');
	var nw = new NwBuilder({
		files: './dist/**/**',
		version: pkg.nwjs || '0.12.3',
		buildDir: './bin',
		buildType: 'versioned',
		cacheDir: './nwjs',
		zip: false,
		platforms: platforms,
		macIcns: (exists('./assets/mac.icns') ? './assets/mac.icns' : undefined),
		winIco: (exists('./assets/win.ico') ? './assets/win.ico' : undefined)
	});
	var shouldLog = (process.argv.indexOf('--log-level=info')>-1 ||
			process.argv.indexOf('--log-level=debug')>-1 ||
			process.argv.indexOf('--log-level=trace')>-1);
	var logOpt = process.argv.indexOf('-l');
	if(!shouldLog && logOpt>-1 && process.argv.length>logOpt+1) {
		shouldLog = (process.argv[logOpt+1]==='info' ||
				process.argv[logOpt+1]==='debug' ||
				process.argv[logOpt+1]==='trace');
	}
	nw.on('log',  function(msg) {
		if(shouldLog || msg.toLowerCase().indexOf('error')>-1) {
			console.log(msg);
		}
	});
	nw[action](callback);
}

function exec(cmd, callback) {
	var child = cp.exec(cmd, {}, function(err, stdout, stderr) {
		if(err) {
			callback(err);
		} else {
			callback();
		}
	});
	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);
}

function exists(file) {
	try {
		return !!(fs.statSync(file));
	} catch(e) {return false;}
}

function getCurrentPlatform() {
	switch(process.platform) {
		case 'darwin':
			return process.arch === 'x64' ? 'osx64' : 'osx32';
		case 'win32':
			return (process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) ? 'win64' : 'win32';
		case 'linux':
			return process.arch === 'x64' ? 'linux64' : 'linux32';
	}
}
