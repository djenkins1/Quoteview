const browserify = require('browserify');
const fs = require('fs');

browserify()
    .add('public/main.min.js').transform( "babelify" , {presets: ["es2015", "react"] } )
    .bundle()
    .pipe(fs.createWriteStream('public/index.js'));
