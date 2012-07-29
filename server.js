var express = require('express'),
    http    = require('http'),
    sqllite = require('sqlite3'),
    nowjs   = require('now');

var PORT = 8000;

var currentUsers = new Object();

//Maintain chatlogs in a database
var sqlite3 = sqllite.verbose();
var db = new sqlite3.Database('chat.db');

var app = express.createServer();
app.configure(function(){
    app.use(express.bodyParser());
    app.use(express.static(__dirname + '/public'));
});

var server = http.createServer(app)
server.listen(PORT);
 
console.log('Server running at http://127.0.0.1:' + PORT);

var everyone = nowjs.initialize(server);

everyone.now.update = function(){
    //Update the current set of users who are online
    this.now.updateUsers(currentUsers);
}

everyone.now.distributeMessage = function(msg){
    everyone.now.receiveMessage(this.now.name, msg);
    //Insert the chat log to db
    db.run("INSERT into chatlog VALUES($name, $log)",{$name:this.now.name,$log:msg});
}

//This function is called to retrieve the chat logs from database
everyone.now.retrieveMessages = function() {
        console.log("inside");
        db.each("SELECT * from chatlog", function(err, row) {
            everyone.now.receiveMessage(row.name, row.log);
            console.log(row.name, row.log);
    });
}

nowjs.on('connect', function(){
    //Update the current set of users when someone joins
    currentUsers[this.now.name] = 1;
    console.log(this.now.name + " joined");
    everyone.now.retrieveMessages();
});

nowjs.on('disconnect', function(){
    //Update the current set of users when someone leaves
    delete currentUsers[this.now.name];
    console.log(this.now.name + " left");
 });