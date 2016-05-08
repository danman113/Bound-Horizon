var port = 8081;
var bh = new Game(24);
var bodyParser = require('body-parser');
var app=require('express')();
app.use(allowCrossDomain);
app.use(bodyParser.json());
var http=require('http').Server(app);
var io=require('socket.io')(http);

app.get('/',function(req,res){
	console.log('request');
	res.send('hello world');
});


io.on('connection',mainConnection);
function mainConnection(socket){
	var player = new User(socket);
	bh.addUser(player);
	console.log('Player added');
	socket.on('disconnect',function(){
		console.log(player.ip+" dCed :C");
		bh.removeUser(player);
	});
	socket.on('rename',function(name){
		var status = bh.rename(player,name);
		console.log('request rename');
		player.socket.emit('rename',{status:status,seed:bh.seed});
	});
	socket.on('playerUpdate', function(position){
		//console.log('request playerUpdate',bh.users,position);
		bh.users[player.name].position = position;
		var json = {};
		for(var val in bh.users){
			json[val] = userToJson(bh.users[val]);
		}
		player.socket.emit('playerUpdate',json);
	});
}

function User(socket){
	this.socket=socket;
	this.id=socket.id;
	this.ip=socket.request.connection.remoteAddress;
	this.name=this.ip;
	this.position = null;
}

function Game(seed){
	this.seed = seed;
	this.users = {};
	this.chats = [];
}

Game.prototype.addUser = function(user){
	if(this.users[user.name]) return false;
	else this.users[user.name] = user;
	return true;
};
Game.prototype.removeUser = function(user){
	delete this.users[user.name];
	return true;
};

Game.prototype.rename = function(user,name){
	if(this.users[name]) return false;
	this.users[name] = user;
	delete this.users[user.name];
	user.name = name;
	return true;
};


function allowCrossDomain (req, res, next) {
    res.header('Access-Control-Allow-Origin', '24.6.91.120');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

http.listen(port, function(){
	console.log("Server started! Listening on port "+port+".");
});

setInterval(function(){
	console.log(bh.users);
},60000);

function userToJson(user){
	var temp = {};
	temp.name = user.name;
	temp.position = user.position;
	return temp;
}