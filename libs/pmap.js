function pmap(height,width){
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

	this.generate = function(size, seed, y_, x_, zoom){
		this.map = generateMap(size);
		zoom = zoom?zoom:1;
		this.moisture = generateMap(size);
		var random = new Math.seedrandom(seed);
		simplex = new SimplexNoise(random);
		var height = this.map.length;
		var width = this.map[0].length;
		var xfreq = 6;
		var yfreq = 6;
		var e = 1.1;
		var aspect = width/height;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var nx = (x/width+y_*(1/zoom)), ny = (y/height+x_*(1/zoom));
				this.map[y][x] = noise(xfreq/xfreq*nx*zoom*aspect, yfreq/xfreq*ny*zoom*aspect);
				this.map[y][x] += noise(xfreq/2*nx*zoom*aspect, yfreq/2*ny*zoom*aspect)*0.4;
				this.map[y][x] += noise(xfreq/4*nx*zoom*aspect, yfreq/4*ny*zoom*aspect)*0.25;
				this.map[y][x] += noise(xfreq/6*nx*zoom*aspect, yfreq/6*ny*zoom*aspect)*0.1;
				this.map[y][x] /= (1+0.4+0.25+0.1);
				this.map[y][x] = Math.pow(this.map[y][x],e);
			}
		}
		
	};

	this.findMax = function(){
		var max = -0xffff;
		for (var y = this.map.length - 1; y >= 0; y--) {
			for (var i = this.map[y].length - 1; i >= 0; i--) {
				if(this.map[y][i]>max) max = this.map[y][i];
			}
		}
		return max;
	};
	this.findMin = function(){
		var max = 0xffff;
		for (var y = this.map.length - 1; y >= 0; y--) {
			for (var i = this.map[y].length - 1; i >= 0; i--) {
				if(this.map[y][i]<max) max = this.map[y][i];
			}
		}
		return max;
	};
}