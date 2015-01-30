# pruno-jade

A Jade mix for pruno that includes gulp-data.

## Usage

```js
"use strict";

var pruno = require('pruno');

pruno.plugins(function(mix) {
  mix
    .configure({ dir: __dirname + '/config' })
    .jade({
      data: '::src/templates/data',
      entry: '::src/templates/**/*.jade',
      dist: '::dist',
      search: [
        '::src/templates/**/*.jade',
        '::src/templates/data/**/*'
      ],
      ignorePrefix: '_'
    });
});
```
