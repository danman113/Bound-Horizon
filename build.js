var builder = require('nw-builder');
var nw = new builder({
	files:['assets/**/*.*','libs/**/*.*','bound.html','bound.js','boundEngine.js','boundThreads.js','package.json'],
	appname:'test',
	buildDir:'./nwjs',
	version: '0.12.3',
	winIco:"./assets/icon.ico",
	zip: true
});
nw.on('log',  console.log);
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});