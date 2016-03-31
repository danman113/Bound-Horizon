/* global PIXI Tink */

function engine(images, obj){
	//public:
	
	var _this         = this;
	this.renderer     = null;
	this.stage        = null;
	this.tink         = null;
	this.width        = 0;
	this.height       = 0;
	this.frames       = 0;
	this.images       = images;
	this.main         = obj.main;
	this.draw         = obj.draw;
	this.update       = obj.update;
	this.mouseDown    = obj.mouseDown || function(){};
	this.mouseRelease = obj.mouseRelease || function(){};
	this.mouseTap     = obj.mouseTap || function(){};
	
	this.mouse = null;
	this.settings = {numberOfThreads:null};
	if(window.Worker){
		this.threads = [];
		for (var i = 0; i < (this.settings.numberOfThreads || navigator.hardwareConcurrency || 4); i++) {
			var worker = new Worker('boundThreads.js');
			this.threads.push(worker);
			worker.onmessage = function(e){
				if(typeof requestCallbacks[e.data.id]=='function'){
					requestCallbacks[e.data.id](e.data.data);
					delete requestCallbacks[e.data.id];
				}
			};
		}
	} else {
		alert('Your browser doesn\'t support web workers');
	}
	//methods:
	
	/**
	 * Initializes the engine. Creates PIXI elements and appends it to the body
	 *
	 */
	this.init = function(){
		_this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight);
		_this.width = window.innerWidth;
		_this.height = window.innerHeight;
		_this.renderer.view.style.position = "absolute";
		_this.renderer.view.style.top = "0px";
		_this.renderer.view.style.left = "0px";
		_this.renderer.view.style.display = "block";
		document.body.appendChild(_this.renderer.view);
		_this.stage = new PIXI.Container();
		_this.tink = new Tink(PIXI, _this.renderer.view);
		_this.mouse = _this.tink.makePointer();
		_this.mouse.release = _this.mouseRelease;
		_this.mouse.press = _this.mouseDown;
		_this.mouse.tap = _this.mouseTap;
		
		makeLoading();
		
		PIXI.loader
		.add(_this.images)
		.on("progress", loading)
		.load(doneLoading);
		
		drawFrame();
	};
	/**
	 * Returns rectangle graphic
	 * @param  {String} style  Style of options
	 * @param  {Number} width  Width of the rectangle
	 * @param  {Number} height Height of the rectangle
	 * @param  {Mixed} options... Additional options depending on style
	 * @return {PIXI.Graphics} rectangle graphic
	 */
	this.makeRoundRectangle = function(style,width,height){
		var rectangle = new PIXI.Graphics();
		switch(style){
			case 'solid':
				rectangle.beginFill(arguments[3]);
				rectangle.drawRoundedRect(0, 0, width, height);
				rectangle.endFill();
			break;
			case 'border':
				rectangle.beginFill(arguments[3]);
				rectangle.lineStyle(arguments[5]?arguments[5]:2,arguments[4], 1);
				rectangle.drawRoundedRect(0, 0, width, height);
				rectangle.endFill();
			break;
		}
		return rectangle;
	};
	
	this.makeTileMap = function(){
		
	}

	/**
	 * Will distribute a list of request among the worker threads.
	 * @param  {TRequest[]} orders an array of TRequest
	 * @return {void}
	 */
	this.orderMultiple = function(orders, callbacks){
		for (var i = 0; i < orders.length; ++i) {
			this.threads[i%this.threads.length].postMessage(orders[i]);
			if(typeof callbacks == 'function')
				requestCallbacks[orders[i].id] = callbacks;
			else if (i<callbacks.length)
				requestCallbacks[orders[i].id] = callbacks[i];
		}
	};

	/**
	 * Orders a webworker to do a request
	 * @param  {TRequest} order          Request you want it to do 
	 * @param  {Number}   [threadNumber] Optional specific thread to use
	 * @return {void}
	 */
	this.order = function(order, callback, threadNumber){
		if(threadNumber == null)
			threadNumber = Math.floor(Math.random()*(this.threads.length-1));
		requestCallbacks[order.id] = callback;
		this.threads[threadNumber].postMessage(order);
	};

	//private:
	
	var loading = null;
	var makeLoading = null;
	var doneLoading = null;
	var drawFrame = null;
	var requestCallbacks = {};
	loading = function(loader, asset){
		var w = (_this.width/3-4)*(loader.progress/100);
		var fillRect1 = _this.makeRoundRectangle('solid',w,48,0xff2222);
		fillRect1.x = _this.width/3+2;
		fillRect1.y = _this.height/2 - fillRect1.height/2 - 2;
		if(_this.stage.children.length>1)
			_this.stage.removeChildAt(1);
		_this.stage.addChild(fillRect1);
		_this.renderer.render(_this.stage);
	};

	makeLoading = function(){
		var rect = _this.makeRoundRectangle('border',_this.width/3,50,0xaaaaaa,0xffffff,4);
		rect.x = _this.width/3;
		rect.y = _this.height/2 - rect.height/2;
		_this.stage.addChild(rect);
	};

	doneLoading = function(){
		for (var i = _this.stage.children.length - 1; i >= 0; i--) {
			_this.stage.removeChildAt(i);
		}
		_this.renderer.render(_this.stage);
		_this.main();
	};

	drawFrame = function(){
		_this.frames++;
		_this.tink.update();
		_this.update();
		_this.draw();
		_this.renderer.render(_this.stage);
		window.requestAnimationFrame(drawFrame);
	};
}

var TRequest = tr();

function tr(){
	var i = 0;
	return function(type,options){
		this.type = type;
		this.options = options;
		this.id = i++;
	}
}

function tilemap(map,mapFunction,tileWidth,tileHeight){
	this.map = map;
	this.graphic = new PIXI.Container();
	this.mapFunction = mapFunction;
	this.create = function(){
		var map = this.map;
		for (var i = 0; i < map.length; ++i) {
			for (var j = 0; j < map[i].length; ++j) {
				var tile = new PIXI.Sprite(this.mapFunction(map[i][j]));
				tile.x = j*tileWidth;
				tile.y = i*tileHeight;
				tile.width = tileWidth;
				tile.height = tileHeight;
				this.graphic.addChild(tile);
			}
		}
		return this.graphic;
	}
	
	this.update = function(){
		var map = this.map;
		for (var i = 0; i < map.length; ++i) {
			for (var j = 0; j < map[i].length; ++j) {
				var tile = this.mapFunction(map[i][j]);
				this.graphic.children[i*map.length+j].texture = tile;
			}
		}
	}
	
}