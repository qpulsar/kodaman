var express = require('express');
var server = express();

//server.use('/kod_klasor', express.static(__dirname + '/kod_klasor')); // sanal dizin yolu üretmek için böyle kullanılabilir
server.use(express.static('kod_klasor'))

server.listen(8080);