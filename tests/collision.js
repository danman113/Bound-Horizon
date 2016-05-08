var worker = new Worker("../boundThreads.js");
var option = {type:'create',size:40,scale:10,options:{x:1,y:1,z:1,resolution:512,seed:1}};
var swimming = false;
var grounds = {};
worker.onmessage = function(e){
	var size = 1024;
	var scale = 200;
	var x = 1*(Math.round(e.data.data.x)*(size));
	var y = -1*(Math.round(e.data.data.y)*(size));
	// console.log(e,x,y);
	if(!grounds[Math.round(e.data.data.x)+"x"+Math.round(e.data.data.y)]) return false;
	var ground = CreateGroundFrom2dArray(
		e.data.data.x+"x"+e.data.data.y,
		e.data.data.map,{
			width:size, // width of the ground mesh (x axis)
			height:size, // depth of the ground mesh (z axis)
			subdivisions:60,  // number of subdivisions
			minHeight:0,   // min height
			maxHeight:scale,  // max height
		},
		scene
	);
	grounds[Math.round(e.data.data.x)+"x"+Math.round(e.data.data.y)].map = e.data.data.map;
	grounds[Math.round(e.data.data.x)+"x"+Math.round(e.data.data.y)].mesh = ground;
	ground.material = new BABYLON.StandardMaterial("d", scene);
	//ground.material.wireframe = true;
	ground.material.diffuseColor = new BABYLON.Color3(0.3, 0.7, 0.3);
	ground.material.backFaceCulling = true;

	ground.position = new BABYLON.Vector3(x, -30, y);
	ground.checkCollisions = true;
	//ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.HeightmapImpostor, mass: 0, friction: 0.5, restitution: 0.7 });
	if(e.data.data.x == 0 && e.data.data.y == 0){
		velocity = -1;
		var hi = camera._onCollisionPositionChange;
		camera._onCollisionPositionChange = function(x,y,z){
			hi(x,y,z);
			if(z && (jumpProgress == 0))
				velocity = 0;
		};
		camera.inputs.add(new BABYLON.FreeCameraGamepadInput());
		camera.inputs.attached.gamepad.gamepadAngularSensibility = 50;
	}
	
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
	window.stats = new Stats();
	document.body.appendChild(stats.domElement );
	stats.domElement.style.position = "absolute";
	stats.domElement.style.top = "0px";
	// Lights
	var light0 = new BABYLON.DirectionalLight("Omni", new BABYLON.Vector3(-2, -5, 2), scene);

	// Need a free camera for collisions
	scene.enablePhysics();
	window.camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, -8, -20), scene);
	camera.attachControl(canvas, true);
	initCamera(camera);
	//Simple crate
	window.box = BABYLON.Mesh.CreateBox("crate", 2, scene);
	window.water = BABYLON.Mesh.CreatePlane("impact", 1, scene);
	window.water.position  = new BABYLON.Vector3(0, 0, 0);
	window.water.scaling = new BABYLON.Vector3(0xfff, 0xfff, 0xfff);
	window.water.material = new BABYLON.StandardMaterial("Mat", scene);
	window.water.material.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
	window.water.rotation.x = Math.PI/2;
	window.water.position.y=120;
	window.water.material.backFaceCulling = false;
	window.c = createCanvas();
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
	loadChunk(0,0);
	enablePointerlock(scene);
	var sepiaKernelMatrix = [
                   0.393, 0.349, 0.272, 0, 0,
                   0.769, 0.686, 0.534, 0, 0,
                   0.189, 0.168, 0.131, 0, 0,
                   0,     0,     0,     0, 0,
                   0,     0,     0,     0, 0
                ];
	window.ppBlur = new BABYLON.ConvolutionPostProcess("Sepia", BABYLON.ConvolutionPostProcess.GaussianKernel , 1, camera, null, engine, true);
	window.ppBlue = new BABYLON.ColorCorrectionPostProcess("color_correction", "/assets/LUT_MatrixBlue.png", 1.0, camera, null, engine, true);
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

function loadChunk(x,y){
	if(grounds[x+"x"+y]){
		return false;
	} else {
		grounds[x+"x"+y] = {x:x,y:y};
		var option = {type:'create',size:40,scale:10,options:{x:x,y:y,z:1+1/512,resolution:512,seed:1}};
		setTimeout(function(){
			worker.postMessage(option);
			
		},Math.floor(Math.random()*0xfff));
		return grounds[x+"x"+y];
	}

}

function eraseChunk(x,y){
	if(grounds[x+"x"+y]){
		if(grounds[x+"x"+y].mesh){
			grounds[x+"x"+y].mesh.dispose(false);
		}
		delete grounds[x+"x"+y];
	} else {
		return false;
	}
}

function streamMap(position,size){
	var range = 2;
	var ctX = Math.floor(1*(position.x/(size)));		//currentTile
	var ctY = Math.floor(-1*(position.z/(size)));
	loadChunk((ctX),(ctY));
	console.log(ctX,ctY);
	var sight = {};
	sight[(ctX+'x'+ctY)] = 1;
	for (var i = 1; i <=range; i++) {
		loadChunk((ctX-i),(ctY-i));
		loadChunk((ctX  ),(ctY-i));
		loadChunk((ctX-i),(ctY  ));
		loadChunk((ctX+i),(ctY-i));
		loadChunk((ctX-i),(ctY+i));
		loadChunk((ctX  ),(ctY+i));
		loadChunk((ctX+i),(ctY  ));
		loadChunk((ctX+i),(ctY+i));
		sight[((ctX-i) + 'x' + (ctY-i))] = 1;
		sight[((ctX  ) + 'x' + (ctY-i))] = 1;
		sight[((ctX-i) + 'x' + (ctY  ))] = 1;
		sight[((ctX+i) + 'x' + (ctY-i))] = 1;
		sight[((ctX-i) + 'x' + (ctY+i))] = 1;
		sight[((ctX  ) + 'x' + (ctY+i))] = 1;
		sight[((ctX+i) + 'x' + (ctY  ))] = 1;
		sight[((ctX+i) + 'x' + (ctY+i))] = 1;
	}
	for(var val in grounds){
		if(!sight[val]){
			var str = val.split('x');
			var delx = str[0];
			var dely = str[1];
			console.log("deleting " + delx + dely);
			eraseChunk(+delx, +dely);
		}
	}
	water.position.x = camera.position.x;
	water.position.z = camera.position.z;
}

function initCamera(camera){
	camera.keysUp = [87, 38];
    camera.keysDown = [83, 40];
    camera.keysLeft = [65, 37];
    camera.keysRight = [68, 39];
	camera.inertia=0;
	camera.speed=20;
	camera.angularSensibility=500;
	camera.position.y=100;
}

function createCanvas(){
	var canvas = document.createElement('canvas');
	var c = canvas.getContext('2d');
	document.body.appendChild(canvas);
	canvas.style.position = 'absolute';
	canvas.style.top = "0px";
	canvas.style.left = "300px";
	canvas.width = 10;
	canvas.height = 10;
	return c;
}



function biome(e) {
	var test = [
		{value:0.5,  color:'102F4A'},
		{value:0.55, color:'4060C0'},
		{value:0.6,  color:'D2B98B'},
		{value:0.65, color:'559944'},
		{value:0.8,  color:'337755'},
		{value:0.9,  color:'BBBBAA'},
		{value:0.9,  color:'ddeeff'},
		{value:1.01, color:'000000'},
	];
	for(var i = 0;i<test.length;++i){
		var bio = test[i];
		if(e<bio.value) return bio.color;
	}
	return 0xffffff;
}

function swim(){
	scene.gravity.y = 0;
	camera.speed = 50;
	// camera.attachPostProcess(ppBlue);
	// camera.attachPostProcess(ppBlur);
}

function walk(){
	scene.gravity.y = -3;
	camera.speed = 20;
	// camera.detachPostProcess(ppBlue);
	// camera.detachPostProcess(ppBlur);
}

function walkManager(){
	if(camera.position.y < water.position.y+4){
		swim();
	} else {
		walk();
	}
	if(camera.position.y < water.position.y-5){
		if(!swimming){
				camera.attachPostProcess(ppBlue);
				camera.attachPostProcess(ppBlur);
		}
		swimming = true;
	} else {
		if(!swimming){
			camera.detachPostProcess(ppBlue);
			camera.detachPostProcess(ppBlur);
		}
		swimming = false;
	}
}

function simpleGamepad(){
	if(!Math.round(navigator.getGamepads()[0]))
		return false;
	var speed = camera._computeLocalCameraSpeed();
	if(Math.round(navigator.getGamepads()[0].axes[1])==-1){
		camera._localDirection.copyFromFloats(0, 0, -speed);
		camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
		BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
		camera.cameraDirection.addInPlace(camera._transformedDirection);
	}
	if(Math.round(navigator.getGamepads()[0].axes[1])==1){
		camera._localDirection.copyFromFloats(0, 0, speed);
		camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
		BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
		camera.cameraDirection.addInPlace(camera._transformedDirection);
	}
	if(Math.round(navigator.getGamepads()[0].axes[0])==-1){
		camera._localDirection.copyFromFloats(-speed, 0, 0);
		camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
		BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
		camera.cameraDirection.addInPlace(camera._transformedDirection);

	}
	if(Math.round(navigator.getGamepads()[0].axes[0])==1){
		camera._localDirection.copyFromFloats(speed, 0, 0);
		camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
		BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
		camera.cameraDirection.addInPlace(camera._transformedDirection);

	}

	if(Math.round(navigator.getGamepads()[0].axes[3])==-1){
		camera.cameraRotation.x-=0.05;
	}
	if(Math.round(navigator.getGamepads()[0].axes[3])==1){
		camera.cameraRotation.x+=0.05;
	}
	if(Math.round(navigator.getGamepads()[0].axes[2])==-1){
		camera.cameraRotation.y-=0.05;
	}
	if(Math.round(navigator.getGamepads()[0].axes[2])==1){
		camera.cameraRotation.y+=0.05;
	}
}