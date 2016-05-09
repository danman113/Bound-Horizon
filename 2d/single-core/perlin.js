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
	function biome(e) {
	  if (e < 0.5) return 0x102F4A;
	  if (e < 0.55) return 0x4060C0;
	  else if (e < 0.6) return 0xD2B98B;
	  else if (e < 0.65) return 0x559944;
	  else if (e < 0.8) return 0x337755;
	  else if (e < 0.9) return 0xBBBBAA;
	  else if (e < 0.95) return 0xddeeff;
	  else return 0x000000;
	}
	

	this.generate = function(size, seed, x_, y_, zoom){
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
				this.map[y][x]/= (1+0.4+0.25+0.1);
				this.map[y][x] = Math.pow(this.map[y][x],e);
			}
		}
		
	};

	this.normalize = function(){
		var max = this.findMax();
		var min = this.findMin();
		var range = max - min;
		console.log(min,max,range);
		for (var y = this.map.length - 1; y >= 0; y--) {
			for (var i = this.map[y].length - 1; i >= 0; i--) {
				this.map[y][i] = (this.map[y][i]+range - max)/range;
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
	this.render = function(){
		var rectangle = new PIXI.Graphics();
		var tileSize = 3;
		for (var y = this.map.length - 1; y >= 0; y--) {
			for (var i = this.map[y].length - 1; i >= 0; i--) {
				rectangle.beginFill(biome(this.map[y][i]));
				rectangle.drawRect(y*tileSize,i*tileSize,tileSize,tileSize);
			}
		}
		return rectangle;
	};
}

function render(a){
	++frames;
	t.update();
	var speedScale=5;
	if(up.isDown || upButton.state=="down"){
		needDraw = true;
		coord.y-=0.001*speedScale;
	}
	if(down.isDown || downButton.state=="down"){
		coord.y+=0.001*speedScale;
		needDraw = true;
	}
	if(left.isDown || leftButton.state=="down"){
		coord.x-=0.001*speedScale;
		needDraw = true;
	}
	if(right.isDown || rightButton.state=="down"){
		coord.x+=0.001*speedScale;
		needDraw = true;
	}
	if(z.isDown){
		coord.z*=1.1;
	}
	if(x.isDown){
		coord.z/=1.1;
	}
	world.render();
	renderer.render(stage);
	window.requestAnimationFrame(render);
}

function main(){
	document.body.appendChild(renderer.view);
	stage.addChild(plot);
	window.upButton    = {state:'hell'};
	window.downButton  = {state:'hell'};
	window.leftButton  = {state:'hell'};
	window.rightButton = {state:'hell'};
	pointer = t.makePointer();
	up = t.keyboard(38);
	down = t.keyboard(40);
	left = t.keyboard(37);
	right = t.keyboard(39);
	z = t.keyboard(90);
	x = t.keyboard(88);
	hi = new pmap();
	up.isDown = true;
	window.world = new game();
	world.init();
	stage.addChild(world.container);
	frames=3;
	render();
	up.isDown = false;
}

var renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);

var stage = new PIXI.Container();
var plot = new PIXI.Container();
renderer.render(stage);
PIXI.loader
.add("guy", "sword2.png")
.load(main);
var t = new Tink(PIXI, renderer.view);
renderer.view.style.position = "absolute";
renderer.view.style.top = "0px";
renderer.view.style.left = "0px";
renderer.view.style.display = "block";
var coord = {x:-0.5,y:-0.5,z:1};
var frames = 0;
var needDraw = false;
function snapshot(x,y){
	this.x = x;
	this.y = y;
	this.settlements = [];
	this.addSettlement = function(settlment){
		this.settlment.push(settlment);
	};
}

function game(){
	this.player = coord;
	this.map = new pmap();
	this.container = new PIXI.Container();
	this.settings = {zoom:1,resolution:128,seed:42};
	this.activeSnapshots = {};
	this.addSnapshot = function(x,y,snap){
		var value = (x*y).toString();
		if(this.activeSnapshots[value]){
			this.activeSnapshots[value].push(snap);
		} else {
			this.activeSnapshots[value] = [snap];
		}
	};
	this.findSnapshot = function(x,y){
		var value = (x*y).toString();
		var arr = this.activeSnapshots[value];
		return arr.find(function(a,b){
			return a.x==x && a.y==y;
		});
	};
	this.renderSnapshot = function(rectangle,x_,y_,zoom ,tileSize){
		zoom = zoom?zoom:this.settings.zoom;
		tileSize = tileSize?tileSize:32;
		this.map.generate(3*this.settings.resolution,this.settings.seed,x_-zoom*0.5*3,y_-zoom*0.5*3,zoom*3);
		rectangle.clear();
		var map = this.map.map;
		for (var y = map.length - 1; y >= 0; y--) {
			for (var i = map[y].length - 1; i >= 0; i--) {
				rectangle.beginFill(this.biome(map[y][i]));
				rectangle.drawRect(y*tileSize,i*tileSize,tileSize,tileSize);
			}
		}
	};
	this.bg = {x:this.player.x,y:this.player.y,img:new PIXI.Graphics(),minimap:new PIXI.Graphics()};
	this.init = function(){
		this.renderSnapshot(this.bg.img,this.bg.x,this.bg.y);
		this.renderSnapshot(this.bg.minimap,this.bg.x,this.bg.y,1,5);
		window.hi = new PIXI.Graphics();
		this.renderSnapshot(window.hi,this.bg.x+3,this.bg.y,1,5);
		this.bg.minimap.scale.x = 0.1;
		this.bg.minimap.scale.y = 0.1;
		hi.scale.x = 0.1;
		hi.scale.y = 0.1;
		hi.position.x = hi.width;
		
		//this.container.addChild(this.bg.img);
		this.container.addChild(this.bg.minimap);
		this.container.addChild(hi);
		this.player.sprite = new PIXI.Sprite(PIXI.utils.TextureCache["sword2.png"]);
		this.container.addChild(this.player.sprite);
		this.player.sprite.x = renderer.width/2-renderer.width/2%32;
		this.player.sprite.y = renderer.height/2-renderer.height/2%32;
	};
	this.getWorldPosition = function(){

	};
	this.render = function(){
		var dx = 0;
		var dy = 0;
		if((this.player.x - this.bg.x)<-1.5){
			this.bg.x-=1.5;
			this.renderSnapshot(this.bg.img,this.bg.x,this.bg.y);
			this.renderSnapshot(window.hi,this.bg.x+3,this.bg.y,1,5);
			this.renderSnapshot(this.bg.minimap,this.bg.x,this.bg.y,1,5);
			console.log('building new');
		}
		if((this.player.x - this.bg.x)>1.3){
			this.bg.x+=1.5;
			this.renderSnapshot(this.bg.img,this.bg.x,this.bg.y);
			this.renderSnapshot(window.hi,this.bg.x+3,this.bg.y,1,5);
			this.renderSnapshot(this.bg.minimap,this.bg.x,this.bg.y,1,5);
			console.log('building new');
		}
		if((this.player.y - this.bg.y)<-1.5){
			this.bg.y-=1.5;
			this.renderSnapshot(this.bg.img,this.bg.x,this.bg.y);
			this.renderSnapshot(window.hi,this.bg.x+3,this.bg.y,1,5);
			this.renderSnapshot(this.bg.minimap,this.bg.x,this.bg.y,1,5);
			console.log('building new');
		}
		if((this.player.y - this.bg.y)>1.1){
			this.bg.y+=1.5;
			this.renderSnapshot(this.bg.img,this.bg.x,this.bg.y);
			this.renderSnapshot(window.hi,this.bg.x+3,this.bg.y,1,5);
			this.renderSnapshot(this.bg.minimap,this.bg.x,this.bg.y,1,5);
			console.log('building new');
		}

		var xOffset = (this.player.x - this.bg.x)*this.settings.resolution*32+this.settings.resolution*32*1.5;
		var yOffset = (this.player.y - this.bg.y)*this.settings.resolution*32+this.settings.resolution*32*1.5;
		this.bg.img.x = -1*xOffset;
		this.bg.img.y = -1*yOffset;
		
	};
	this.biome = function(e) {
	  if (e < 0.5) return 0x102F4A;
	  if (e < 0.55) return 0x4060C0;
	  else if (e < 0.6) return 0xD2B98B;
	  else if (e < 0.65) return 0x559944;
	  else if (e < 0.8) return 0x337755;
	  else if (e < 0.9) return 0xBBBBAA;
	  else if (e < 0.95) return 0xddeeff;
	  else return 0x000000;
	};
}