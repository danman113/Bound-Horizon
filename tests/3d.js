var worker = new Worker("../boundThreads.js");
var option = {type:'create',size:40,options:{x:1,y:1,z:3,resolution:512,seed:(new Date()).getTime()}};
worker.onmessage = function(e){
	console.log(e.data.data.map);
	var pathArray = [];
	for(var i = 0; i < e.data.data.map.length; i++) {
		var arr = [];
		for(var j = 0; j < e.data.data.map[i].length; j++){
			arr.push(new BABYLON.Vector3(i-option.options.resolution/2,e.data.data.map[i][j]*option.size,j-option.options.resolution/2));
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

	worker.postMessage(option);
	// This creates a basic Babylon Scene object (non-mesh)
	var scene = new BABYLON.Scene(engine);

	// This creates and positions a free camera (non-mesh)
	var camera = new BABYLON.ArcRotateCamera("camera1", 0,0,0,BABYLON.Vector3.Zero(), scene);
	console.log(camera.fov = 90);
	camera.setPosition(new BABYLON.Vector3(0, 15, -30));
	// This targets the camera to scene origin
	camera.setTarget(BABYLON.Vector3.Zero());

	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);

	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

	// Default intensity is 1. Let's dim the light a small amount
	light.intensity = 0.7;

	// Our built-in 'sphere' shape. Params: name, subdivs, size, scene
	var sphere = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

	// Move the sphere upward 1/2 its height
	sphere.position.y = 1;

	// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
	var pathArray = [];
	for(var i = option.options.resolution/2*-1; i < option.options.resolution/2; i++) {
		var arr = [];
		for(var j = option.options.resolution/2*-1; j<option.options.resolution/2; j++){
			arr.push(new BABYLON.Vector3(i,-1,j));
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
	//groundTexture.wireframe = true;
	return scene;

};