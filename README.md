# Light-Promise
A Super Lightweight [Promise/A+](https://promisesaplus.com) implementation. Less than 80 lines coffee-script, less than 3kb after [uglified](https://github.com/mishoo/UglifyJS/), less than 1kb after g-zipped. 

## Notice
- This implementation is just a **partially** implementation.
- Follow features are not supported:
    - Type checking. You are supposed to make sure that your parameters are of correct type or just null value.
    - `Then` can be called only once for the same Promise object.
    - Any Promises/A+-compliant thenable objects is not acceptted.
- New features may be or may never be added.

***However, it works for most of the time, and I think that's enough.***

## Usage
### Node
Run `npm install -S light-promise` in command line.
Then,
```javascript
var Promise = require('light-promise')
```
### Browser
Download the light-promise.min.js file.
> Light-promise is also a [bower](http://bower.io/) package.

- Add a script tag in your HTML file
```html
<script type="text/javascript" src="/light-promise.min.js"></script>
```
-  The global variables `Promise` and `light_promise` are available after the above script tag. 
    - Notice that if the browser supports [Promise](http://devdocs.io/javascript/global_objects/promise) natively, Promise variable will keep to be the native one, which I recommand you to use.
```javascript
var p = new Promise(function(resolve, reject){
    // ...
});
p.then(function(){});
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
`Promise.all(Array promises)`<br/>