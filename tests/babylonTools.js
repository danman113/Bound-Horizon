var CreateGroundFrom2dArray = function (name, array, options, scene) {
    var width = options.width || 10;
    var height = options.height || 10;
    var subdivisions = options.subdivisions || 1;
    var minHeight = options.minHeight;
    var maxHeight = options.maxHeight || 10;
    var updatable = options.updatable;
    var onReady = options.onReady;
    var ground = new BABYLON.GroundMesh(name, scene);
    ground._subdivisions = subdivisions;
    ground._width = width;
    ground._height = height;
    ground._maxX = ground._width / 2;
    ground._maxZ = ground._height / 2;
    ground._minX = -ground._maxX;
    ground._minZ = -ground._maxZ;
    ground._setReady(false);
    var bufferWidth = array.length;
    var bufferHeight = array.length;
    var buffer = new Uint8ClampedArray(bufferWidth*bufferHeight*4);
    for(var i = bufferHeight-1; i>=0;--i){
		for(var j = bufferWidth-1; j>=0;--j){
			buffer[bufferWidth*i*4+(j*4)] = array[i][j]*255;
			buffer[bufferWidth*i*4+(j*4)+1] = array[i][j]*255;
			buffer[bufferWidth*i*4+(j*4)+2] = array[i][j]*255;
			buffer[bufferWidth*i*4+(j*4)+3] = 255;
		}	
	}
    var vertexData = BABYLON.VertexData.CreateGroundFromHeightMap({
        width: width, height: height,
        subdivisions: subdivisions,
        minHeight: minHeight, maxHeight: maxHeight,
        buffer: buffer, bufferWidth: bufferWidth, bufferHeight: bufferHeight
    });
    vertexData.applyToMesh(ground, updatable);
    ground._setReady(true);
    //execute ready callback, if set
    if (onReady) {
        onReady(ground);
    }
    return ground;
};

function enablePointerlock(scene){
    var _this = this;
    // Request pointer lock
    var canvas = scene.getEngine().getRenderingCanvas();
    // On click event, request pointer lock
    canvas.addEventListener("click", function(evt) {
        canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    }, false);

    // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
    var pointerlockchange = function (event) {
        _this.controlEnabled = (
                           document.mozPointerLockElement === canvas
                        || document.webkitPointerLockElement === canvas
                        || document.msPointerLockElement === canvas
                        || document.pointerLockElement === canvas);
        // If the user is alreday locked
        if (!_this.controlEnabled) {
            _this.camera.detachControl(canvas);
        } else {
            _this.camera.attachControl(canvas);
        }
    };

    // Attach events to the document
    document.addEventListener("pointerlockchange", pointerlockchange, false);
    document.addEventListener("mspointerlockchange", pointerlockchange, false);
    document.addEventListener("mozpointerlockchange", pointerlockchange, false);
    document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
}