var name = prompt('What would you liked to be named?');
var connection = prompt('What server would you like to connect to?','http://localhost:8081');
var socket = io.connect(connection);
socket.emit('rename', name);
var users = {};
var chats = [];
socket.on('connect_error', function(){
	alert('Unable to connect to server. Starting single player.');
	main();
	socket.close();
});
socket.on('rename',function(renamed){
	console.log(renamed);
	if(renamed.status)
		alert('connected');
	else
		alert('Unable to connect to server');
	if(window.seed){
		seed = renamed.seed;
	}
	main();
});

socket.on('playerUpdate',function(e){
	// console.log('playerUpdate');
	// console.log(e);
	updateUsers(e);
});

function updateUsers(newer){
	for(var i in newer){
		if(i == name) continue;
		if(users[i]){
			users[i].position = newer[i].position;
			if(users[i].mesh && users[i].position){
				users[i].mesh.position = new BABYLON.Vector3(users[i].position.x,users[i].position.y,users[i].position.z);
			}
		} else {
			users[i] = newer[i];
			users[i].mesh = BABYLON.Mesh.CreateBox("crate", 2, scene);
			users[i].mesh.material = new BABYLON.StandardMaterial("Mat", scene);
			users[i].mesh.material.alpha = 0.9;
			var text = i;
			var outputplane = BABYLON.Mesh.CreatePlane("outputplane", 3, scene, false);
			outputplane.position.y = 2;
			outputplane.material = new BABYLON.StandardMaterial("outputplane", scene);
			outputplane.parent = users[i].mesh;
			//outputplane.position = new BABYLON.Vector3(newer[i].position.x, newer[i].position.y, newer[i].position.z);

			var outputplaneTexture = new BABYLON.DynamicTexture("dynamic texture", 256, scene, true);
			outputplaneTexture.hasAlpha = true;
			outputplane.material.diffuseTexture = outputplaneTexture;
			outputplane.material.specularColor = new BABYLON.Color3(0, 0, 0);
			outputplane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
			outputplane.material.backFaceCulling = false;

			outputplaneTexture.drawText(i, null, 140, "bold 60px verdana", "white","transparent");
			

		}
		
	}
}