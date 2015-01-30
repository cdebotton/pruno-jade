"use strict";

var pruno = module.parent.require('pruno');
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
      '::src/templates/data/**/*'
    ],
    ignorePrefix: '_'
  };
};

JadeTask.prototype.enqueue = function(gulp, params) {
  params || (params = {});
  var compiler = 'jade';
  var opts = distillOptions(JadeTask, params);
  var topLevel = pruno.get('topLevel');
  var IGNORE_SEARCH = new RegExp('^'+ params.ignorePrefix);

  gulp.src(params.entry)
    .on('err', function(err) {
      pruno.notify('JadeTask', err);
    })
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
        path.basename(file.path).replace(/\.html$/, '')
      );

      if (fs.existsSync(dataFile + '.js')) {
        data = require(dataFile + '.js');
      }
      else if (fs.existsSync(dataFile + '.json')) {
        data = require(dataFile + '.json');
      }
      if (typeof data === 'function') {
        data(cb);
      }
      else {
        cb(null, data);
      }
    }))
    .pipe(jade(opts))
    .pipe(gulp.dest(params.dist));
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

module.exports = pruno.extend(JadeTask);
