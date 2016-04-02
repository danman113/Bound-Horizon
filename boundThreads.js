importScripts('./libs/simplex-noise.min.js','./libs/seedrandom.min.js','./libs/pmap.js');
var map = new pmap();
onmessage = function(e){
	switch(e.data.type){
		case 'create':
			generateMap(e);
		break;
		case 'e':

		break;
	}
};

function generateMap(e){
	
	var data = e.data.options;
	map.generate(data.resolution,data.seed,data.x,data.y,data.z);
	postMessage(new response('create',{map:map.map,moisture:map.moisture,x:data.x,y:data.y,z:data.z}, e.data.id));
	map.map = [];
	map.moisture = [];
}

function response(type, options, id){
	this.type = type;
	this.data = options;
	this.id = id;
}