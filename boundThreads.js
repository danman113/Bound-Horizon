importScripts('./libs/simplex-noise.min.js','./libs/seedrandom.min.js','./libs/pmap.js');
onmessage = function(e){
	console.log('hello from threads', e);
	switch(e.data.type){
		case 'create':
			generateMap(e);
		break;
		case 'e':

		break;
	}
};

function generateMap(e){
	var hi = new pmap();
	var data = e.data.options;
	hi.generate(data.resolution,data.seed,data.x,data.y,data.z);
	postMessage(new response('create',hi.map));
}

function response(type,options){
	this.type = type;
	this.data = options;
}