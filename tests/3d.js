var worker = new Worker("./boundThreads.js");
var option = {type:'create',size:40,scale:10,options:{x:1,y:1,z:3,resolution:512,seed:(new Date()).getTime()}};
worker.onmessage = function(e){
	//console.log(e.data.data.map);
	var pathArray = [];
	for(var i = 0; i < e.data.data.map.length; i++) {
		var arr = [];
		for(var j = 0; j < e.data.data.map[i].length; j++){
			arr.push(new BABYLON.Vector3(
					(i-option.options.resolution/2)*option.scale,
					e.data.data.map[i][j]*option.size*option.scale-(option.size*option.scale)/2,
					(j-option.options.resolution/2)*option.scale));
		}
		pathArray.push(arr);
	}
	window.ground = BABYLON.MeshBuilder.CreateRibbon("ground1", {pathArray:pathArray,instance:window.ground});
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

	// This creates a basic Babylon Scene object (non-mesh)
	var scene = new BABYLON.Scene(engine);

	// This creates and positions a free camera (non-mesh)
	window.camera = new BABYLON.FreeCamera("camera1",new BABYLON.Vector3(0, 50, -30), scene);
	console.log(camera.fov = 90);
	//camera.setPosition(new BABYLON.Vector3(0, 50, -30));
	// This targets the camera to scene origin
	//camera.setTarget(BABYLON.Vector3.Zero());

	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);

	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

	// Default intensity is 1. Let's dim the light a small amount
	light.intensity = 0.7;

	// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
	window.sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);
	window.sphere.position.y = 50;
	//sphere.applyGravity = true;
	//sphere.checkCollisions = true;
	scene.gravity = new BABYLON.Vector3(0, -0.8, 0);
	scene.workerCollisions  = true;
	scene.collisionsEnabled = true;
	camera.checkCollisions  = true;
    //camera.applyGravity     = true;
    camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
	// Move the sphere upward 1/2 its height
	sphere.position.y = 1;

	// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
	var pathArray = [];
	for(var i = option.options.resolution/2*-1; i < option.options.resolution/2; i++) {
		var arr = [];
		for(var j = option.options.resolution/2*-1; j<option.options.resolution/2; j++){
			arr.push(new BABYLON.Vector3(i*option.scale,-1,j*option.scale));
		}
		pathArray.push(arr);
	}
	window.ground = BABYLON.MeshBuilder.CreateRibbon("ground1", {pathArray:pathArray,updatable:true}, scene);
	window.ocean = BABYLON.MeshBuilder.CreateRibbon("ocean", {pathArray:pathArray,updatable:true}, scene);
	var groundTexture = new BABYLON.StandardMaterial("texture1", scene);
	ground.material = groundTexture;
	groundTexture.diffuseColor = new BABYLON.Color3(11/256, 148/256, 68/256);
	var oceanTexture = new BABYLON.StandardMaterial("texture2", scene);
	oceanTexture.diffuseColor = new BABYLON.Color3(11/256, 148/256, 240/256);
	ocean.material = oceanTexture;
	ocean.position.y = option.size/2;
	ground.checkCollisions = true;
	ocean.checkCollisions = true;
	//groundTexture.wireframe = true;
	setTimeout(function(){
		worker.postMessage(option);
	},1000);
	return scene;

};