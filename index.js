"use strict";

var shelljs = require('shelljs');
var data = require('gulp-data');
var jade = require('gulp-jade');
var fs = require('fs');
var path = require('path');
var through = require('through2');

function JadeTask(params) {
  this.params = (params || {});
}

JadeTask.displayName = 'JadeTask';

JadeTask.getDefaults = function() {
  return {
    data: '::src/templates/data',
    entry: '::src/templates/**/*.jade',
    dist: '::dist',
    search: [
      '::src/templates/**/*.jade',
      '::src/templates/data/**/*',
      '::src/**/webpack-stats.json'
    ],
    ignorePrefix: '_'
  };
};

JadeTask.prototype.enqueue = function(gulp, params) {
  params || (params = {});
  var compiler = 'jade';
  var opts = distillOptions(JadeTask, params);
  var topLevel = shelljs.pwd();
  var IGNORE_SEARCH = new RegExp('^'+ params.ignorePrefix);

  gulp.src(params.entry)
    .pipe(through.obj(function(file, enc, cb) {
      var fileName = path.basename(file.path);
      var isSys = IGNORE_SEARCH.test(fileName);
      cb(null, isSys ? null : file);
    }))
    .pipe(data(function(file, cb) {
      var data;
      var dataFile = path.join(
        topLevel,
        params.data,
        path.basename(file.path).replace(/\.(html|jade|swig)$/, '')
      );

      if (fs.existsSync(dataFile + '.js')) {
        data = require(dataFile + '.js');
        delete require.cache(dataFile + '.js');
      }
      else if (fs.existsSync(dataFile + '.json')) {
        data = require(dataFile + '.json');
        delete require.cache(dataFile + '.json');
      }
      if (typeof data === 'function') {
        data(cb);
      }
      else {
        cb(null, data);
      }
    }))
    .pipe(jade(opts))
    .on('error', function(err) {
      console.error(err);
    })
    .pipe(gulp.dest(params.dist));
};

JadeTask.prototype.generateWatcher = function(gulp, params) {
  return true;
};

function distillOptions(Task, params) {
  var defaults = Object.keys(Task.getDefaults())
    .concat(['taskName']);

  return Object.keys(params)
    .filter(function (param) {
      return defaults.indexOf(param) === -1;
    })
    .reduce(function (memo, param) {
      memo[param] = params[param];
      delete params[param];
      return memo;
    }, {});
}

module.exports = JadeTask;
