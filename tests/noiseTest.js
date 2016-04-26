/* global SimplexNoise PIXI */
window.onload = function(){
	load();
	setupStage();
	setupBiome();
	update();
};

function load(){
	var elements = ['x','y','e','z','e1','e2','e3','seed','freq'];
	for (var i = elements.length; i--; ) {
		document.getElementById(elements[i]).onchange = update;
		document.getElementById(elements[i]).oninput = update;
	}
}

function update(){
	var obj = {};
	var elements = ['x','y','e','z','e1','e2','e3','seed','freq'];
	for (var i = elements.length; i--; ) {
		var val = document.getElementById(elements[i]).value;
		obj[elements[i]] = (+val);
	}
	obj.zoom = obj.z;
	//console.log(obj);
	test.map.generate(64,obj);
	//console.log(test.map.map);
	for(var i = 0;i<test.biomes.length;++i){
		var value = document.getElementById('biome'+i);
		var color = document.getElementById('biome'+i+'c');
		test.biomes[i].value = +value.value;
		test.biomes[i].color = parseInt(color.value.substr(1),16);
	}
	test.biomes.sort(function(a,b){
		return a.value-b.value;
	});
	drawMap(test.map.map);
	test.renderer.render(test.stage);
	document.getElementById('output').innerHTML = JSON.stringify(obj,null,'\t');
}

function setupStage(){
	var DOMstage = document.getElementById('stage').getBoundingClientRect();
	test.renderer = PIXI.autoDetectRenderer(DOMstage.width, DOMstage.height);
	test.stage = new PIXI.Container();
	test.renderer.view.style.top = '0px';
	test.renderer.view.style.left = '0px';
	test.renderer.view.style.display = 'block';
	document.getElementById('stage').appendChild(test.renderer.view);
}

function drawMap(map){
	test.stage.children = [];
	var g = new PIXI.Graphics();
	var size = test.renderer.height/64;
	for(var i = 0; i<map.length;++i){
		for(var j = 0; j<map[i].length;++j){
			g.beginFill(biome(map[i][j]));
			g.drawRect(j*size, i*size, size, size);
		}
	}
	test.stage.addChild(g);
}

function biome(e) {
	for(var i = 0;i<test.biomes.length;++i){
		var bio = test.biomes[i];
		if(e<bio.value) return bio.color;
	}
	return 0xffffff;
}

function setupBiome(){
	var b = document.getElementById('biome');
	for(var i = 0;i<test.biomes.length;++i){
		var bio = test.biomes[i];
		var str = 
		'<div class="form-group">'+
		'<label class="col-sm-2 control-label">'+i+'</label>'+
		'<div class="col-sm-5">'+
			'<input type="number" max="1" min="0" step="0.01" value="'+bio.value+'" id="biome'+i+'" class="form-control" />'+
		'</div>'+
		'<div class="col-sm-5">'+
			'<input type="color"id="biome'+i+'c" value="#'+bio.color.toString(16)+'" class="form-control" />'+
		'</div>'+
		'</div>';
		b.innerHTML += str;
	}
	for(var i = 0;i<test.biomes.length;++i){
		var value = document.getElementById('biome'+i);
		var color = document.getElementById('biome'+i+'c');
		value.oninput = update;
		value.onchange = update;
		color.oninput = update;
		color.oninput = update;
	}
	document.getElementById('export').onclick = exportColormap;
	document.getElementById('import').onclick = importColormap;
}

function exportColormap(){
	prompt('copy paste this',JSON.stringify(test.biomes));
}
function importColormap(){
	var imported = prompt('paste in your colormap','[{value:0.0,color:0xffffff}]');
	try{
		test.biomes = JSON.parse(imported);
		if(test.biomes.length<8){
			throw new Error('Length invalid');
		}
	} catch(e){
		alert('Error importing, you probably pasted something wrong. Error:',e);
	}
	for(var i = 0;i<test.biomes.length;++i){
		var value = document.getElementById('biome'+i);
		var color = document.getElementById('biome'+i+'c');
		value.value = test.biomes[i].value;
		color.value = '#'+test.biomes[i].color.toString(16);
	}

}

function pmap(){
	var simplex = new SimplexNoise();
	function noise(nx, ny) {
	  return simplex.noise2D(nx, ny) / 2 + 0.5;
	}
	var generateMap = function(size){
		var map = [];
		for(var i = 0; i < size; ++i){
			var row = [];
			for(var x = 0; x < size; ++x){
				row.push(0);
			}
			map.push(row);
		}
		return map;
	};

	this.generate = function(size, options){
		this.map = generateMap(size);
		var zoom = options.zoom?options.zoom:1;
		this.moisture = generateMap(size);
		var random = new Math.seedrandom(options.seed);
		simplex = new SimplexNoise(random);
		var height = this.map.length;
		var width = this.map[0].length;
		var xfreq = options.freq;
		var yfreq = options.freq;
		var e = options.e;
		var aspect = width/height;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var nx = (x/width+options.x*(1/zoom)), ny = (y/height+options.y*(1/zoom));
				this.map[y][x] = noise(xfreq/xfreq*nx*zoom*aspect, yfreq/xfreq*ny*zoom*aspect);
				this.map[y][x] += noise(xfreq/2*nx*zoom*aspect, yfreq/2*ny*zoom*aspect)*(options.e1);
				this.map[y][x] += noise(xfreq/4*nx*zoom*aspect, yfreq/4*ny*zoom*aspect)*(options.e2);
				this.map[y][x] += noise(xfreq/6*nx*zoom*aspect, yfreq/6*ny*zoom*aspect)*(options.e3);
				this.map[y][x] /= (1+options.e1+options.e2+options.e3);
				this.map[y][x] = Math.pow(this.map[y][x],e);
			}
		}
	};
}


var test = {
	map:new pmap(),
	biomes:[
		{value:0.5,  color:0x102F4A},
		{value:0.55, color:0x4060C0},
		{value:0.6,  color:0xD2B98B},
		{value:0.65, color:0x559944},
		{value:0.8,  color:0x337755},
		{value:0.9,  color:0xBBBBAA},
		{value:0.9,  color:0xddeeff},
		{value:1.01, color:0x000000},
	]
};