/**************************************************/
// https://github.com/sumitchawla/file-browser
// bu projeden alındı. 
// Bu proje zaten bizim yapmaya çalıştığımız işin sunucu kısmını yapmış. Biz de bu ana kadar client kısmını yapmıştık.
// Bu yüzden sunucu kısmını (dosyaların ve klasörlerin yayınlanması ve gösterilmesi) bu projeden aldık. 
// Projeye başladığımız için çatallayarak çatalladığımız projeye koyacağız : https://github.com/huseyingunes/file-browser
// Ayrıca kendi başlattığımız proje de burada olacak.
// Projenin başında bu modülün istediğimiz işi yaptığını farketsaeydik doğrudan çatallayarak devam etmek daha mantıklı olurmuş.
/**************************************************/
var http = require('http');
var _ = require('lodash');
var express = require('express');
var fs = require('fs');
var path = require('path');
var util = require('util');
// eklendi
var Prism = require('prismjs');
require('prismjs/components/prism-core.min');
require('prismjs/plugins/keep-markup/prism-keep-markup.js');
require('prismjs/plugins/line-numbers/prism-line-numbers.min');
require('prismjs/plugins/command-line/prism-command-line.min');
require('prismjs/plugins/line-highlight/prism-line-highlight.min');
require('prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.min');



var argv = require('yargs')
  .usage('Usage: $0 <command> [options]')
  .command('$0', 'Browse file system.')
  .example('$0 -e .js .swf .apk', 'Exclude extensions while browsing.')
  .alias('i', 'include')
  .array('i')
  .describe('i', 'File extension to include.')
  .alias('e', 'exclude')
  .array('e')
  .describe('e', 'File extensions to exclude.')
  .alias('p', 'port')
  .describe('p', 'Port to run the file-browser. [default:8081]')
  .help('h')
  .alias('h', 'help')
  // .describe('h', '')
  // .epilog('copyright 2015')
  // .demandOption(['i', 'e']) // required fields
  .check(_checkValidity)
  .argv;

function _checkValidity(argv) {
  if (argv.i && argv.e) return new Error('Select -i or -e.');
  if (argv.i && argv.i.length == 0) return new Error('Supply at least one extension for -i option.');
  if (argv.e && argv.e.length == 0) return new Error('Supply at least one extension for -e option.');
  return true;
}

function collect(val, memo) {
  if(val && val.indexOf('.') != 0) val = "." + val;
  memo.push(val);
  return memo;
}

var app = express();
var dir =  process.cwd();
app.use(express.static(dir)); //app public directory
app.use(express.static(__dirname)); //module directory
var server = http.createServer(app);

if(!argv.port) argv.port = 8081;

server.listen(argv.port);
console.log("Please open the link in your browser http://localhost:" + argv.port);

app.get('/files', function(req, res) {
 var currentDir =  dir;
 var query = req.query.path || '';
 if (query) currentDir = path.join(dir, query);
 console.log("browsing ", currentDir);
 fs.readdir(currentDir, function (err, files) {
     if (err) {
        throw err;
      }
      var data = [];
      files
      .filter(function (file) {
          return true;
      })
      .forEach(function (file) {
        try {
                //console.log("processing ", file);
                var isDirectory = fs.statSync(path.join(currentDir,file)).isDirectory();
                if (isDirectory) {
                  data.push({ Name : file, IsDirectory: true, Path : path.join(query, file)  });
                } else {
                  var ext = path.extname(file);
                  if(argv.exclude && _.contains(argv.exclude, ext)) {
                    console.log("excluding file ", file);
                    return;
                  }
                  else if(argv.include && !_.contains(argv.include, ext)) {
                    console.log("not including file", file);
                    return;
                  }
                  data.push({ Name : file, Ext : ext, IsDirectory: false, Path : path.join(query, file) });
                }

        } catch(e) {
          console.log(e);
        }

      });
      data = _.sortBy(data, function(f) { return f.Name });
      res.json(data);
  });
});

app.get('/', function(req, res) {
 res.redirect('html/index.html'); 
});



app.get('/file', function(req, res) {
	//res.send('hello world'+req.query.file_name);
	var path = require('path');
	var file_name = path.parse(req.query.file_name).base;
	var file_ext = path.parse(req.query.file_name).ext;
	
	//var file_name = req.query.file_name.replace(/^.*[\\\/]/, '')
	fs.readFile(req.query.file_name, 'utf8', function (err,data) {
		if (err) {
			return console.log(err);
		}
		var file_type;
		switch(file_ext){
			case "js" : file_type=Prism.languages.javascript; break;
			case "css" : file_type=Prism.languages.css; break;
			case "c" : file_type=Prism.languages.c; break;
			case "cpp" : file_type=Prism.languages.cpp; break;
			default : file_type=Prism.languages.clike;
		};
		
		var code_highlight = Prism.highlight(data, file_type);
		res.send(code_highlight);
	});
	
});

