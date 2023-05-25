const http = require('http');
const fs = require('fs');
const HTML_DIR = './build';
// const PORT = process.env.PORT || 3000;
const PORT = 80;
const OUTPUT_FILE= './output/30_022_128_1_0_Questions_annot.json';

const server = http.createServer(onRequest);

server.listen(PORT);
console.log("Starting server.js...")


function onRequest(request, response) {
    if (request.method == 'POST') {
        console.log(request.url);
        var body = "";
        request.on('readable', function() {
            console.log("Reading...");
            r = request.read();
            if (r != null) {
                body += r;
            }
            // body += request.read();
        });
        request.on('end', function() {
            console.log("End of request.");
            console.log(body);
            fs.writeFile(`${OUTPUT_FILE}`, JSON.stringify(JSON.parse(body).data), err => {
                if (err) {
                  console.error(err);
                }
                // file written successfully
              });
            response.writeHead(200);
            response.end();
        });
    } else {
        if ('/' == request.url) {
            console.log("Redirecting to index.html...")
            request.url = '/index.html';
        }
        if ('/annotate' == request.url) { 
            console.log("Reading output file...")
            fs.readFile(OUTPUT_FILE, function(err, data) {
                if (err) {
                    console.log(err);
                    response.writeHead(404);
                    response.end(JSON.stringify(err));
                    return;
                }
                console.log("Sending output file...")
                response.writeHead(200);
                response.end(data);
                return;
            });
        } else {
            fs.readFile(HTML_DIR + request.url, function(err, data) {
                console.log(HTML_DIR + request.url)
                if (err) {
                    response.writeHead(404);
                    response.end(JSON.stringify(err));
                    return;
                }
                response.writeHead(200);
                response.end(data);
            });
        }
    }
}