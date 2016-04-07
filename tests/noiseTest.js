/* global SimplexNoise PIXI */
window.onload = function(){
    load();
    setupStage();
    update();
}

function load(){
    var elements = ['x','y','e','z','e1','e2','e3','seed'];
    for (var i = elements.length; i--; ) {
        document.getElementById(elements[i]).onchange = update;
    }
    
}

function update(){
    var obj = {};
    var elements = ['x','y','e','z','e1','e2','e3','seed'];
    for (var i = elements.length; i--; ) {
        var val = document.getElementById(elements[i]).value;
        obj[elements[i]] = (+val);
    }
    test.map.generate(64,obj);
    console.log(test.map.map);
    document.getElementById('output').innerHTML = JSON.stringify(obj,null,'\t');
}

function setupStage(){
    var DOMstage = document.getElementById('stage').getBoundingClientRect();
    test.renderer = PIXI.autoDetectRenderer(DOMstage.width, DOMstage.height);
	test.renderer.view.style.top = '0px';
	test.renderer.view.style.left = '0px';
	test.renderer.view.style.display = 'block';
	document.getElementById('stage').appendChild(test.renderer.view);
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
		var xfreq = 6;
		var yfreq = 6;
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
    map:new pmap()
};