var http = require('http');
var fs = require('fs');
var path = require('path');
var currentUsers = new Object();
server = http.createServer(function (request, response) {
 
    console.log('request starting...');
     
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './gapshap.html';
         
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
    //update the current set of users who are online
    this.now.updateUsers(currentUsers);
}

everyone.now.distributeMessage = function(msg){
    everyone.now.receiveMessage(this.now.name, msg);
}

nowjs.on('connect', function(){
      currentUsers[this.now.name] = 1;
      console.log(this.now.name + " joined");
});
nowjs.on('disconnect', function(){
      var name = this.now.name;
      delete currentUsers[name];
      console.log(this.now.name + " left");
 });

