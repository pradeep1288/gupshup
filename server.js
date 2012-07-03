var http = require('http'),
    fs   = require('fs');
server = http.createServer(function (req, res) {
  fs.readFile('gapshap.html', function(err, data){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(data);
    res.end();
  });
});
server.listen(8000);
console.log('Server running at http://127.0.0.1:1337/');


var everyone = require("now").initialize(server);

everyone.now.distributeMessage = function(msg){
    everyone.now.receiveMessage(this.now.name, msg);
}
