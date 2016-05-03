<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>

# light-promise
A Super Lightweight [Promise/A+](https://promisesaplus.com) implementation, tested by [promises-tests](https://github.com/promises-aplus/promises-tests) and [promises-es6-tests](https://github.com/promises-es6/promises-es6)

[![NPM version](https://badge.fury.io/js/light-promise.svg)](http://badge.fury.io/js/light-promise)
[![Build Status](https://travis-ci.org/dracupid/light-promise.svg)](https://travis-ci.org/dracupid/light-promise)
[![Build status](https://ci.appveyor.com/api/projects/status/github/dracupid/light-promise?svg=true)](https://ci.appveyor.com/project/dracupid/light-promise)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

## Usage
### Node
Run `npm install -S light-promise` in command line.
Then,
```javascript
let Promise = require('light-promise')
```
### Browser
Download the light-promise.min.js file.

> Light-promise is also a [bower](http://bower.io/) package.

- Add a script tag in your HTML file
```html
<script src="/light-promise.js"></script>
```
-  The global variables `Promise` is available after the above script tag.
    - Notice that if the browser supports [Promise](http://devdocs.io/javascript/global_objects/promise) natively, Promise variable will keep to be the native one, which I recommand you to use.
```javascript
var p = new Promise(function(resolve, reject){
    // ...
})
p.then(function(){})
```
> You can also use light-promise with [requirejs](http://requirejs.org/) or [browserify](http://browserify.org/) as well.

## API

- Object Methods

`new Promise(Function<Function resolve, Function reject> resolver)`<br/>
`.then([Function onFulfilled] [, Function onRejected])`<br/>
`.catch(Function onRejected)`<br/>

- Static Methods

`Promise.resolve(Dynamic value)`<br/>
`Promise.reject(Dynamic reason)`<br/>
`Promise.all(Array promises)` --extended method<br/>
`Promise.race(Array promises)` --extended method<br/>

## Test
```
npm test
```
