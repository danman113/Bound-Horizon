function snapshot(x,y){
	this.x = x;
	this.y = y;
	this.settlements = [];
	this.addSettlement = function(settlment){
		this.settlment.push(settlment);
	};
}

function game(){
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
	this.bg = {x:-0.5,y:-0.5,img:new PIXI.Graphics(),minimap:new PIXI.Graphics()};
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
	this.engine = new engine(['./assets/load1.png','./assets/load2.png','./assets/grass.png','./assets/ice.png','./assets/mountain.png','./assets/mountainrock.png','./assets/ocean.png','./assets/river.png','./assets/sand.png','./assets/snow.png','./assets/sword2.png','./assets/trans.png'],function(){
		console.log('all loaded');
	},function(){
		if(PIXI.loader.progress == 100){
			
		}
	},function(){
		if(PIXI.loader.progress == 100){

		}
	});
	this.testThreads = function(x){
		var requests = [];
		for (var i = x - 1; i >= 0; i--) {
			requests.push(new TRequest('create',{x:5,y:5,z:1,resolution:128,seed:50}));
		}
		this.engine.orderMultiple(requests);
	};
}
var boundHorizon = new game();
window.onload = boundHorizon.engine.init;