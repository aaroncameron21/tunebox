var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var stormpath = require('express-stormpath');

var app = express();
var mailer = require('express-mailer');
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/tunebox',function(err) {
  if (err) throw err;
  console.log("Mongoose Connected");
});

var partials = {};

function readPartial(name) {
  fs.readFile('./views/partials/' + name + '.html', 'utf-8', function(err,result) {
    if (err) throw err;
    partials[name] = result;
  });
}
readPartial('header');
readPartial('navbar');
readPartial('footer');

app.use(function(req,res,next) {
  req.partials = partials;
  next();
});




app.set('views', './views');
app.set('view engine', 'jade');

// From a stormpath tutorial, not entirely sure what it does. Stormpath initialization
// app.use(stormpath.init(app, {
//   expand: {
//     customData: true
//   }
// }));
 
// app.get('/', stormpath.getUser, function(req, res) {
//   res.render('home');
// });

app.use(function(req,res,next) {
  // If logging is active
  if (log) {
    var date = new Date();
    // if this is a route instead of a file
    if (req.url.indexOf(".",0) === -1) {
      // Log info to console
      console.log(req.ip + " | " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds(), req.method, req.url);
    }
  }
  next();
});

// Attach server variables and functions to request
app.use(function(req,res,next) {
  req.debug = debug;
  req.secure = secure;
  next();
});

// Give access to the following directories:
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/audio'));
app.use(express.static(__dirname + '/node_modules'));

// Routers: 
app.use('/tune',require('./routers/tune')());
app.use('/version',require('./routers/version')());
app.use('/upload',require('./routers/upload')());

/*
* Process command line arguments
*/
var debug = false; // Prevents sending of notification emails
var secure = false; // Should we run on port 80 with https?
var log = false; // Should we log activity to console?

// Once Stormpath is ready
// app.on('stormpath.ready',function(){
//   console.log('Stormpath Ready');
//   // For each command line argument provided
//   process.argv.forEach(function (val, index, array) {
//     if (val === "debug") {
//       debug = true;
//     }
//     if (val === "https") {
//       secure = true;
//     }
//     if (val === "log") {
//       log = true;
//     }
//   });
//   console.log("Debug Mode:",debug ? "On":"Off");
//   console.log("Log Activity:",log ? "On":"Off");
//   console.log("Security:",secure ? "HTTPS":"HTTP");
//   console.log("Port:",secure ? "443":"8080");
// });


if (secure) {
  // Gather credentials
  var privateKey = fs.readFileSync( 'portal_cehs_health_umt_edu.key' );
  var certificate = fs.readFileSync( 'portal_cehs_health_umt_edu.csr' );
  var credentials = {
      key: privateKey,
      cert: certificate
  };
  // Start https server listening on 80
  var httpsServer = https.createServer(credentials, app);
  httpsServer.listen(443);
} else {
  // Start http server listening on 8080
  var httpServer = http.createServer(app);
  httpServer.listen(8080);
}
