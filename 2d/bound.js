/* global PIXI Tink engine TRequest tilemap */

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
	this.loaded = false;
	this.map = null;
	this.tilemap = null;
	this.tiles = {};
	this.coord = {x:5,y:5};
	this.mainMap = {nw:null,ne:null,sw:null,se:null};
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
	
	this.init = function(){
		console.log('Program is now running');
		_this.tiles['ocean']    = PIXI.utils.TextureCache['../assets/ocean.png'];
		_this.tiles['river']    = PIXI.utils.TextureCache['../assets/river.png'];
		_this.tiles['sand']     = PIXI.utils.TextureCache['../assets/sand.png'];
		_this.tiles['trans']    = PIXI.utils.TextureCache['../assets/trans.png'];
		_this.tiles['grass']    = PIXI.utils.TextureCache['../assets/grass.png'];
		_this.tiles['mountain'] = PIXI.utils.TextureCache['../assets/mountain.png'];
		_this.tiles['snow']     = PIXI.utils.TextureCache['../assets/snow.png'];
		_this.tiles['ice']      = PIXI.utils.TextureCache['../assets/ice.png'];
		var mapFunc = function(e){
			if (e < 0.5) return _this.tiles['ocean'];
			if (e < 0.55) return _this.tiles['river'];
			else if (e < 0.6) return _this.tiles['sand'];
			else if (e < 0.65) return _this.tiles['trans'];
			else if (e < 0.8) return _this.tiles['grass'];
			else if (e < 0.9) return _this.tiles['mountain'];
			else if (e < 0.95) return _this.tiles['snow'];
			else return _this.tiles['ice'];
		};
		var tSize = 20;
		_this.mainMap.nw = new tilemap([],mapFunc,tSize,tSize);
		_this.mainMap.sw = new tilemap([],mapFunc,tSize,tSize);
		_this.mainMap.ne = new tilemap([],mapFunc,tSize,tSize);
		_this.mainMap.se = new tilemap([],mapFunc,tSize,tSize);
		_this.render();
		_this.loaded = true;
		/*
		var map = _this.tilemap.create();
		map.width = _this.engine.width;
		map.height = _this.engine.width;
		_this.engine.stage.addChild(map);
		*/
	};
	this.getWorldPosition = function(x,y){
		var x = Math.floor((x%1)*_this.settings.resolution);
		var y = Math.floor((y%1)*_this.settings.resolution);
		return [x,y];
	};
	this.render = function(){
		var i = 0;
		var create = this.mainMap.nw.map.length?false:true;
		var x = Math.ceil(this.coord.x);
		var y = Math.ceil(this.coord.y);
		
		//[1,2]
		//[4,3] 3=x,y
		// console.log("("+(x-1)+","+(y-1)+")"+"("+x+","+(y-1)+")");
		// console.log("("+(x-1)+","+y+")"+"("+x+","+y+")");
		
		_this.engine.orderMultiple(
			[
			new TRequest('create',{x:x-1,y:y-1,z:1,resolution:_this.settings.resolution,seed:_this.settings.seed}),
			new TRequest('create',{x:x,y:y-1,z:1,resolution:_this.settings.resolution,seed:_this.settings.seed}),
			new TRequest('create',{x:x,y:y,z:1,resolution:_this.settings.resolution,seed:_this.settings.seed}),
			new TRequest('create',{x:x-1,y:y,z:1,resolution:_this.settings.resolution,seed:_this.settings.seed})
			], 
		function(data){
			//console.log(data.x,data.y);
			if(data.x == x-1 && data.y == y-1){
				_this.mainMap.nw.map = data.map;
			} else if (data.x == x && data.y == y-1){
				_this.mainMap.ne.map = data.map;
			} else if (data.x == x && data.y == y){
				_this.mainMap.se.map = data.map;
			} else if (data.x == x-1 && data.y == y){
				_this.mainMap.sw.map = data.map;
			}
			++i;
			if(i == 4){
				if(create){
					var nw = _this.mainMap.nw.create();
					var ne = _this.mainMap.ne.create();
					ne.x = nw.width;
					var se = _this.mainMap.se.create();
					se.x = nw.width;
					se.y = nw.height;
					var sw = _this.mainMap.sw.create();
					sw.y = nw.height;
					_this.tilemap = new PIXI.Container();
					_this.tilemap.addChild(nw);
					_this.tilemap.addChild(ne);
					_this.tilemap.addChild(se);
					_this.tilemap.addChild(sw);
					_this.engine.stage.addChild(_this.tilemap);
					_this.tilemap.width  = _this.engine.width;
					_this.tilemap.height = _this.engine.width;
				} else {
					_this.mainMap.nw.update();
					_this.mainMap.ne.update();
					_this.mainMap.sw.update();
					_this.mainMap.se.update();
				}
			}
		});
		
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
			
			if(_this.loaded){
				_this.engine.controls.left.release = function (){_this.coord.x-=1;_this.render();console.log('l');};
				_this.engine.controls.right.release =function(){_this.coord.x+=1;_this.render();console.log('r');};
				_this.engine.controls.up.release = function(){_this.coord.y-=1;_this.render();console.log('u');};
				_this.engine.controls.down.release = function(){_this.coord.y+=1;_this.render();console.log('d');};
				// if(_this.engine.controls.left.isDown){
				// 	_this.coord.x+=0.2;
				// } else if (_this.engine.controls.right.isDown){
				// 	_this.coord.x-=0.2;
				// } else if (_this.engine.controls.up.isDown){
				// 	_this.coord.y-=0.2;
				// } else if (_this.engine.controls.down.isDown){
				// 	_this.coord.y+=0.2;
				// }
				if(_this.engine.mouse.isDown){
					// var offsetX = boundHorizon.tilemap.graphic.x;
					// var offsetY = boundHorizon.tilemap.graphic.y;
					// var width = boundHorizon.tilemap.graphic._width;
					// var height = boundHorizon.tilemap.graphic._height;
					// var x = Math.floor(((_this.engine.mouse.x-offsetX)/width)*_this.settings.resolution);
					// var y = Math.floor(((_this.engine.mouse.y-offsetY)/height)*_this.settings.resolution);
					// _this.tilemap.map[y][x] = 1;
					// _this.tilemap.update();
				}
			}
			
		},
		draw:function(){
			
		},
		mouseRelease:function(){
			
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