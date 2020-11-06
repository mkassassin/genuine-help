var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
var http = require('http');
var mime = require('mime-types');
var app = express();

var ErrorManagement = require('./server/handling/ErrorHandling.js');
var LogManagement = require('./server/handling/LogHandling.js');

// Certificate
// const credentials = {
// 	key: fs.readFileSync('./ssl/privkey.pem', 'utf8'),
// 	cert: fs.readFileSync('./ssl/cert.pem', 'utf8'),
// 	ca: fs.readFileSync('./ssl/chain.pem', 'utf8')
// };
const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

// http.createServer(function (req, res) {
//    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
//    res.end();
// }).listen(80);

// Process On Every Error
   process.setMaxListeners(0);
   process.on('unhandledRejection', (reason, promise) => {
      console.error('Un Handled Rejection');      
      ErrorManagement.ErrorHandling.ErrorLogCreation('', 'Un Handled Rejection', '', reason);
   });
   process.on('uncaughtException', function (err) {
      console.log(err);
      
      console.error('Un Caught Exception');
      ErrorManagement.ErrorHandling.ErrorLogCreation('', 'Un Caught Exception', '', err.toString());
   });


// DB Connection
   const uri = "mongodb://localhost:27017/genuine-help";
   mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

   // const uri = "mongodb://localhost:24874/genuine-help";
   // mongoose.connect(uri, { user: 'MeanAppUser', pass: 'G1e2N3u4I5n6E7h8E9l0P', auth:{ authSource: 'admin' }, useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });
   mongoose.connection.on('error', function (err) {
      console.log('Mongodb Connection Error');
      console.log(err);
   });
   mongoose.connection.once('open', function () {
      console.log('DB Connectivity, Success!');
   });


// Middleware 
   app.use(cors());
   app.use(bodyParser.urlencoded({ limit: '15mb', extended: true, parameterLimit: 100000 }));
   app.use(bodyParser.json({ limit: '15mb' }));

// Every request Log Creation 
   app.use('/API/', function (req, res, next) { 
      LogManagement.LogHandling.LogCreation('Web', req); 
      return next();
   }); 

   app.use('/Image/Proof', express.static('uploads/payment-proofs/'));

// API Routes
   require('./server/routes/ePin.routes')(app);
   require('./server/routes/customers.routes')(app);
   require('./server/routes/help.routes')(app);

// // Web Access
   app.use('/*.html|/*.js|/*.css|/*.png|/*.jpg|/*.svg|/*.ico|/*.ttf|/*.woff|/*.txt|/*.eot|/*.json', function (req, res, next) {
      if (req.headers['accept-encoding'] && req.headers.host === 'aquila-admin.pptssolutions.com') {
         const cond = req.headers['accept-encoding'].includes('gzip');
         if (cond) {
            const contentType = mime.lookup(req.originalUrl);
            req.url = req.url + '.gz';
            res.set('Content-Encoding', 'gzip');
            res.set('Content-Type', contentType);
         }
      }
      next();
   });

// Set up the middleware stack
   app.use(express.static(__dirname + '/client/dist/client/'));
   app.use(function(req, res) {
      res.sendFile(path.join(__dirname, '/client/dist/client', 'index.html'));
   });

// 404 
   app.use('*', function (req, res) {
      res.sendFile(path.join(__dirname+'/404-Error.html'));
   });

// Connect Http
   httpServer.listen(3000, () => {
      console.log('HTTP Server running on port 3000');
   });
   // httpsServer.listen(443, () => {
   //    console.log('HTTPS Server running on port 443');
   // });
