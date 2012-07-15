var http = require('http');
var fs = require('fs');
var path = require('path');
var currentUsers = new Object();

//Maintain chatlogs in a database
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('chat.db');

server = http.createServer(function (request, response) {
 
    console.log('request starting...');
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './gupshup.html';
         
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
     
});
server.listen(8000);
 
console.log('Server running at http://127.0.0.1:8000/');

 var nowjs = require('now');
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