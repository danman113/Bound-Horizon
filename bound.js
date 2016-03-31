/* global PIXI Tink engine TRequest */

function snapshot(x,y){
	this.x = x;
	this.y = y;
	this.settlements = [];
	this.addSettlement = function(settlment){
		this.settlment.push(settlment);
	};
}

function game(){
	var _this = this;
	this.map = null;
	this.tilemap = null;
	this.tiles = {};
	this.seed = 42;
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
	this.bg = {x:-0.5,y:-0.5,img:new PIXI.Graphics(),minimap:new PIXI.Graphics()};
	this.init = function(){
		console.log('Program is now running');
		this.engine.order(new TRequest('create',{x:5,y:5,z:1,resolution:128,seed:this.seed}), function(data){
			_this.map = data;
			_this.tiles['ocean']    = PIXI.utils.TextureCache['./assets/ocean.png'];
			_this.tiles['river']    = PIXI.utils.TextureCache['./assets/river.png'];
			_this.tiles['sand']     = PIXI.utils.TextureCache['./assets/sand.png'];
			_this.tiles['trans']    = PIXI.utils.TextureCache['./assets/trans.png'];
			_this.tiles['grass']    = PIXI.utils.TextureCache['./assets/grass.png'];
			_this.tiles['mountain'] = PIXI.utils.TextureCache['./assets/mountain.png'];
			_this.tiles['snow']     = PIXI.utils.TextureCache['./assets/snow.png'];
			_this.tiles['ice']      = PIXI.utils.TextureCache['./assets/ice.png'];
			_this.tilemap = new tilemap(data.map,
			function(e){
				if (e < 0.5) return _this.tiles['ocean'];
				if (e < 0.55) return _this.tiles['river'];
				else if (e < 0.6) return _this.tiles['sand'];
				else if (e < 0.65) return _this.tiles['trans'];
				else if (e < 0.8) return _this.tiles['grass'];
				else if (e < 0.9) return _this.tiles['mountain'];
				else if (e < 0.95) return _this.tiles['snow'];
				else return _this.tiles['ice'];
			},40,40);
			var map = _this.tilemap.create();
			map.width = _this.engine.width;
			map.height = _this.engine.height;
			_this.engine.stage.addChild(map);
		});
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
	
	this.testThreads = function(x){
		var requests = [];
		for (var i = x - 1; i >= 0; i--) {
			requests.push(new TRequest('create',{x:5,y:5,z:1,resolution:1024,seed:50}));
		}
		this.engine.orderMultiple(requests, function(data){
			console.log(data);
		});
	};
	this.engineObject = {
		main:function(){
			console.log('all assets loaded');
			_this.init();
		},
		update:function(){
			
		},
		draw:function(){
			
		},
		mouseRelease:function(){
			_this.engine.order(new TRequest('create',{x:5,y:5,z:1,resolution:128,seed:++_this.seed}), function(data){
				_this.tilemap.map = data.map;
				_this.tilemap.update();
			});
		}
	};
	this.engine = new engine([
		'./assets/load1.png',
		'./assets/load2.png',
		'./assets/grass.png',
		'./assets/ice.png',
		'./assets/mountain.png',
		'./assets/mountainrock.png',
		'./assets/ocean.png',
		'./assets/river.png',
		'./assets/sand.png',
		'./assets/snow.png',
		'./assets/sword2.png',
		'./assets/trans.png'],
	this.engineObject);
}
var boundHorizon = new game();
window.onload = boundHorizon.engine.init;