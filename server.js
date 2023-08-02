const http = require('http');
const fs = require('fs');
const mongodb = require('mongodb');
const dotenv = require('dotenv');
const AnnotationsDAO = require('./src/dao/annotationsDAO.js');
const AnnotatorsDAO = require('./src/dao/annotatorsDAO.js');


dotenv.config()

const HTML_DIR = './build';
const PORT = process.env.PORT || 80;

const OUTPUT_FILE= './output/13_017_112_out-7_22_23_test_annot.json';

const client = new mongodb.MongoClient(
    `mongodb://127.0.0.1:27017/${process.env.ANNOTATIONS_COLLECTION}`
);

const server = http.createServer(onRequest);

async function main() {
    try {
        // Connect to MongoDB server
        await client.connect();
        await AnnotationsDAO.injectDB(client);
        await AnnotatorsDAO.injectDB(client);

        server.listen(PORT);

        console.log("Starting server.js...");
        console.log("Listening on port " + PORT);

    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

async function addAnnotation(annotData) {
    // console.log("Writing to db data")
    // console.log(annotData)
    data = JSON.parse(annotData).data;
    console.log(data);
    try {
        // const annotationsResponse = await AnnotationsDAO.updateAnnotations(
        //     'testerooni',
        //     data
        // )
        console.log(data);
        if (Object.keys(data).length > 0) {
            const annotationsResponse = await AnnotationsDAO.addAnnotation(
                // data[data.length-1]['annotator'],
                // data[data.length-1]['doc_index'],
                // data[data.length-1]['line_index'],
                // data[data.length-1]['label']
                data['annotator'],
                data['doc_index'],
                data['line_index'],
                data['label']
            )
            var { error } = annotationsResponse
            if (error) {
                console.log(error);
              // res.status(500).json({ error });
            }
            const updateLineIndex = await AnnotatorsDAO.updateProgress(
                data['annotator'],
                data['line_index']+1
            );
        }     
      } 
         catch(e) {
            console.log(e);
    //     res.status(500).json({ error: e.message })
       }
};


async function getAnnotatorProgress(annot_name) {
    console.log("annotator name:")
    console.log(annot_name);
    try {
        const annotatorProgressResponse = await AnnotatorsDAO.getAnnotatorProgress(
            annot_name
        )
        var { error } = annotatorProgressResponse
        if (error) {
            console.log(error);
          // res.status(500).json({ error });
        }
        return annotatorProgressResponse[0]['progress']
      } 
         catch(e) {
            console.log(e);
       }
};


async function onRequest(request, response) {
    if (request.method == 'POST') {
        if ('/annotate' == request.url) { 
            var body = "";
            request.on('readable', function() {
                r = request.read();
                if (r != null) {
                    body += r;
                }
            });
            request.on('end', function() {
                // Write to DB
                addAnnotation(body);
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end();
            });
        } else if ('/progress' == request.url) { 
            var body = "";
            request.on('readable', function() {
                r = request.read();
                if (r != null) {
                    body += r;
                }
            });
            request.on('end', function() {
                console.log(body);
                response.writeHead(200);
                response.end();
            });
        }
    } else {
        if ('/' == request.url) {
            request.url = '/index.html';
        } 
        if (capture= request.url.match(/\/progress\/(\w+)$/)) { 
                const annotator = capture[1];
                console.log("Annotator name from url:")
                console.log(annotator);
                const progress = await getAnnotatorProgress(annotator);
                //response.writeHead(200);
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify(progress));
        }
        if ('/annotate' == request.url) { 
            fs.readFile(OUTPUT_FILE, function(err, data) {
                if (err) {
                    console.log(err);
                    response.writeHead(404);
                    response.end(JSON.stringify(err));
                    return;
                }
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(data);
                return;
            });
        } 
        else {
            fs.readFile(HTML_DIR + request.url, function(err, data) {
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

main().catch(console.error);