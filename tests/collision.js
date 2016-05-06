var worker = new Worker("../boundThreads.js");
var option = {type:'create',size:40,scale:10,options:{x:1,y:1,z:3,resolution:512,seed:(new Date()).getTime()}};
var ready = false;
worker.onmessage = function(e){
	window.ground = CreateGroundFrom2dArray(
		'your-mesh-name',
		e.data.data.map,{
			width:400, // width of the ground mesh (x axis)
			height:400, // depth of the ground mesh (z axis)
			subdivisions:40,  // number of subdivisions
			minHeight:0,   // min height
			maxHeight:30,  // max height
		},
		scene
	);
	ground.material = new BABYLON.StandardMaterial("d", scene);
	//ground.material.wireframe = true;
	ground.material.diffuseColor = new BABYLON.Color3(0.3, 0.7, 0.3);
	ground.material.backFaceCulling = false;
	ground.position = new BABYLON.Vector3(5, -30, -15);
	ground.checkCollisions = true;
	ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.HeightmapImpostor, mass: 0, friction: 0.5, restitution: 0.7 });
	velocity = -1;
	var hi = camera._onCollisionPositionChange;
	camera._onCollisionPositionChange = function(x,y,z){
		hi(x,y,z);
		if(z && (jumpProgress == 0))
			velocity = 0;
	};
};

var pathFunction = function(k) {
	var path = []; 
	for (var i = 0; i < 60; i++) {
		var x = i - 30;
		var y = 0;
		var z = k;
		path.push(new BABYLON.Vector3(x, y, z));
	}
	return path;
};


var createScene = function () {
	var scene = new BABYLON.Scene(engine);

	// Lights
	var light0 = new BABYLON.DirectionalLight("Omni", new BABYLON.Vector3(-2, -5, 2), scene);
	var light1 = new BABYLON.PointLight("Omni", new BABYLON.Vector3(2, -5, -2), scene);

	// Need a free camera for collisions
	scene.enablePhysics();
	window.camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, -8, -20), scene);
	camera.attachControl(canvas, true);
	initCamera(camera);
	//Simple crate
	window.box = BABYLON.Mesh.CreateBox("crate", 2, scene);
	window.box2 = BABYLON.Mesh.CreateBox("crate2", 2, scene);
	box2.visibility=0;
	box.scaling.x = 10;
	box.scaling.y = 3;
	box.scaling.z = 10;

	camera.position.x = 40;
	box.material = new BABYLON.StandardMaterial("Mat", scene);
	box.material.alpha = 0.9;
	//ground.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
	box.position = new BABYLON.Vector3(5, -9, -10);

	//Set gravity for the scene (G force like, on Y-axis)
	scene.gravity = new BABYLON.Vector3(0, -0.3, 0);

	// Enable Collisions
	scene.collisionsEnabled = true;

	//Then apply collisions and gravity to the active camera
	camera.checkCollisions = true;
	camera.applyGravity = true;

	//Set the ellipsoid around the camera (e.g. your player's size)
	camera.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);

	//finally, say which mesh will be collisionable
	//ground.checkCollisions = true;
	box.checkCollisions = true;
	worker.postMessage(option);
	enablePointerlock(scene);
	return scene;
};

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
			buffer[bufferWidth*j*4+(i*4)] = array[i][j]*255;
			buffer[bufferWidth*j*4+(i*4)+1] = array[i][j]*255;
			buffer[bufferWidth*j*4+(i*4)+2] = array[i][j]*255;
			buffer[bufferWidth*j*4+(i*4)+3] = 255;
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

var velocity = 0;
var jumpProgress = 0;
var jump = (function(){	
	var height = 0;
	return function(){
		if(velocity == 1){
			camera._collideWithWorld(new BABYLON.Vector3(0,1,0));
			jumpProgress++;
		} else if (velocity == -1) {
			camera._collideWithWorld(new BABYLON.Vector3(0,0,0));
		}
		if(jumpProgress>30){
			velocity = -1;
			jumpProgress=0;
		}
		
	};
})();

function initCamera(camera){
	camera.keysUp = [87, 38];
    camera.keysDown = [83, 40];
    camera.keysLeft = [65, 37];
    camera.keysRight = [68, 39];
	camera.inertia=0;
	camera.speed=10;
	camera.angularSensibility=500;
}
