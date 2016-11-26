var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csurf = require('csurf');
var express = require('express');
var extend = require('xtend');
var forms = require('forms');
var fileUpload = require('express-fileupload');
var mkdirp = require('mkdirp');
 
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
 
var mongo = require('soa-tools').mongo;
var parseForm = require('soa-tools').parseForm;
var handleCSRF = require('soa-tools').handleCSRF;

var Tune     = require('../models/tune');
var Version     = require('../models/version');

 
function renderForm(req,res,locals,view){
  res.render(view || 'version', extend({
    csrfToken: req.csrfToken(),
    partials: req.partials
  },locals||{}));
}

module.exports = function route(){


 
  var router = express.Router();
  router.use(cookieParser());
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
  router.use(fileUpload());
  router.use(csurf({ cookie: true }));

  router.post('/:version_id', function(req, res) {
    console.log("POST UPLOAD");
    console.log("BODY:",req.body);
    console.log("PARAMS:",req.params);
    console.log("FILES:",req.files);

    if (!req.files || !req.files.file) {
        res.send('No files were uploaded.');
        return;
    }

    var version_id = req.params.version_id;
    if (version_id) {
      Version.findById(version_id,function(err,version) {
        if (err) throw err;
        Tune.findById(version.tune, function(err,tune){
          if (err) throw err;
          var tune_id = tune._id;
          var file = req.files.file;
          var path = 'audio/' + tune_id;
          mkdirp(path,function(err) {
            if (err) throw err;
            var re = /(?:\.([^.]+))?$/;
            file.mv(path + "/" + version_id + "." + re.exec(file.name)[1], function(err) {
              if (err) throw err;
              version.file = true;
              version.save().then(
                function(val) {
                  res.redirect('/version/' + version_id);
                },
                function(err) {
                  res.send(err);
                }
              );
            });
          });
        });
      });
    } else {
      console.log("No version_id provided");
      res.send('No files were uploaded.');
    }
  });

  // This is an error handler for this router
  router.use(handleCSRF(renderForm));
 
  return router;
};