var builder = require('nw-builder');
var nw = new builder({
	files:['assets/**/*.*','src/**/*.*','libs/**/*.*','index.html','bound-horizon.js','package.json'],
	appname:'Bound Horizon',
	platforms:['win32','win64'],
	buildDir:'./bin',
	version: '0.13.0',
	winIco:"./assets/icon.ico",
	zip: true
});
var server = new builder({
	files:['server/node_modules/**/*.*','server/server.js','server/server.html','server/package.json'],
	appname:'Bound Horizon Server',
	platforms:['win32','win64'],
	buildDir:'./bin',
	version: '0.13.0',
	winIco:"./assets/icon.ico",
	zip: true
});
server.on('log', console.log);
nw.on('log',  console.log);
nw.build().then(function () {
   console.log('Client build complete!');
   return server.build();
}).then(function(){
	console.log('Server build complete!');
}).catch(function (error) {
    console.error(error);
});