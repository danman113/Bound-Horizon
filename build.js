var builder = require('nw-builder');
var nw = new builder({
	files:['assets/**/*.*','libs/**/*.*','bound.html','bound.js','boundEngine.js','boundThreads.js','package.json'],
	appname:'Bound Horizon',
	platforms:['win32','win64'],
	buildDir:'./nwjs',
	version: '0.13.0',
	winIco:"./assets/icon.ico",
	zip: true
});
nw.on('log',  console.log);
nw.build().then(function () {
   console.log('all done!');
}).catch(function (error) {
    console.error(error);
});