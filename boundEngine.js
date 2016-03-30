function engine(images, main, draw, update){
	//public:
	
	var _this = this;
	this.renderer = null;
	this.stage = null;
	this.tink = null;
	this.width = 0;
	this.height = 0;
	this.frames = 0;
	this.images = images;
	this.main = main;
	this.draw = draw;
	this.update = update;
	this.mouse = null;
	this.settings = {numberOfThreads:null};
	if(window.Worker){
		this.threads = [];
		for (var i = 0; i < (this.settings.numberOfThreads || navigator.hardwareConcurrency || 4); i++) {
			var worker = new Worker('boundThreads.js');
			this.threads.push(worker);
			worker.onmessage = function(e){
				switch(e.data.type){
					case 'create':
						console.log(e.data.data);
					break;
				}
			};
		}
	} else {
		alert('Your browser doesn\'t support web workers');
	}
	//methods:
	
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
		_this.mouse.release = function(){boundHorizon.testThreads(10);};
		makeLoading();
		PIXI.loader
		.add(_this.images)
		.on("progress", loading)
		.load(doneLoading);
		drawFrame();
		_this.renderer.render(_this.stage);
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

	/**
	 * Will distribute a list of request among the worker threads.
	 * @param  {TRequest[]} orders an array of TRequest
	 * @return {void}
	 */
	this.orderMultiple = function(orders){
		for (var i = orders.length - 1; i >= 0; i--) {
			this.threads[i%this.threads.length].postMessage(orders[i]);
		}
	};

	/**
	 * Orders a webworker to do a request
	 * @param  {TRequest} order          Request you want it to do 
	 * @param  {Number}   [threadNumber] Optional specific thread to use
	 * @return {void}
	 */
	this.order = function(order, threadNumber){
		if(threadNumber == null)
			threadNumber = Math.floor(Math.random()*(this.threads.length-1));
		console.log('using thread ' + threadNumber);
		this.threads[threadNumber].postMessage(order);
	};

	//private:
	
	var loading = null;
	var makeLoading = null;
	var doneLoading = null;
	var drawFrame = null;
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

function TRequest(type,options){
	this.type = type;
	this.options = options;
}