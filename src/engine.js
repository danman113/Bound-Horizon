/* global PIXI Tink Stats navigator */

function Engine(settings){
	//public:
	
	var _this         = this;
	this.settings = {numberOfThreads:null};
	if(window.Worker){
		this.threads = [];
		for (var i = 0; i < (this.settings.numberOfThreads || navigator.hardwareConcurrency || 4); i++) {
			var worker = new Worker('./src/boundThreads.js');
			this.threads.push(worker);
			worker.onmessage = function(e){
				if(typeof _this._requestCallbacks[+e.data.id]=='function'){
					_this._requestCallbacks[+e.data.id](e.data.data);
					delete _this._requestCallbacks[+e.data.id];
				}
			};
		}
	} else {
		alert('Your browser doesn\'t support web workers. No non-webworker support added at this time.');
	}

	//Private
	this._requestCallbacks = {};
}


//methods:

/**
 * Initializes the engine. Creates PIXI elements and appends it to the body
 *
 */
Engine.prototype.init = function(){

};

/**
 * Will distribute a list of request among the worker threads.
 * @param  {TRequest[]} orders an array of TRequest
 * @return {void}
 */
Engine.prototype.orderMultiple = function(orders, callbacks){
	for (var i = 0; i < orders.length; ++i) {
		this.threads[i%this.threads.length].postMessage(orders[i]);
		if(typeof callbacks == 'function')
			this._requestCallbacks[orders[i].id] = callbacks;
		else if (i<callbacks.length)
			this._requestCallbacks[orders[i].id] = callbacks[i];
	}
};

/**
 * Orders a webworker to do a request
 * @param  {TRequest} order          Request you want it to do 
 * @param  {Number}   [threadNumber] Optional specific thread to use
 * @return {void}
 */
Engine.prototype.order = function(order, callback, threadNumber){
	if(threadNumber == null)
		threadNumber = Math.floor(Math.random()*(this.threads.length-1));
	this._requestCallbacks[order.id] = callback;
	this.threads[threadNumber].postMessage(order);
};


/**
 * TRequest: Thread Request. A request for a thread to do something
 * @Class
 * @param  {String}   [type] Type of request to send to thread, this determines
 *                    What options you need.
 * @param  {Object}   [options] Options to specify to the thread.
 */
var TRequest = tr();
function tr(){
	var i = 0;
	return function(type,options){
		this.type = type;
		this.options = options;
		this.id = i++;
	};
}
