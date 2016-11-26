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

function remove(req,res) {
    Version.remove({
      _id: req.params.version_id
    },function(err,version) {
      if (err) res.send(err);
      renderForm(req,res,{success: true, message: 'Version deleted!', data: version},'edit-version');
    });
}

function create(req,res) {
    var version = new Version();
    version.description = req.body.description;
    version.tempo = req.body.tempo;
    version.key = req.body.key;
    version.tune = req.body.tune;
    version.save().then(
      function(val) {
        res.redirect("/version/" + val._id);
      },
      function(reason) {
        renderForm(req,res,{success: false, errors: ['Version creation failed! ' + reason]},'create-version');
      }
    );
}

function get(req,res) {
  var id;
  if (id = req.params.version_id) {
    Version.findById(id, function(err, version) {
      if (err) res.send(err);
      if (version) {
        version.findTune(function(err,tune) {
          if (err) throw err;
          renderForm(req,res,{success: true, data: extend(version.toObject(),{tune: tune})},'edit-version');
        });
      } else {
        renderForm(req,res,{success: false, errors: ['Version not found!']},'edit-version');
      }
    });
  } else {
    renderForm(req,res,{success: false},'error');
  }
}

function update(req,res) {
  Version.findById(req.params.version_id, function(err, version) {
    if (err) res.send(err);
    version.description = req.body.description || version.description;
    version.key = req.body.key || version.key;
    version.tempo = req.body.tempo || version.tempo;
    version.tuneId = req.body.tuneId || version.tuneId;
    version.save().then(
      function(val) {
        version.findTune(function(err,tune) {
          if (err) throw err;
          val.tune = tune;
          renderForm(req,res,{success: true, message: 'Version updated!', data: val },'edit-version');
        });
      },
      function(reason) {
        version.findTune(function(err,tune) {
          if (err) throw err;
          version.tune = tune;
          renderForm(req,res,{success: false, errors: ['Version update failed! ' + reason], data: version},'edit-version');
        });
      }
    );
  });
}


module.exports = function route(){

 
  var router = express.Router();
  router.use(cookieParser());
  router.use(bodyParser.urlencoded({ extended: true }));
  router.use(bodyParser.json());
  router.use(csurf({ cookie: true }));

  router.use(fileUpload());








  router.post('/', function(req, res) {
    create(req,res);
  });

  router.post('/:version_id', function(req, res) {
      if (req.body.delete === 'true') {
        remove(req,res);
      } else {
        update(req,res);
      }
  });

  router.get('/', function(req, res) {
    if (req.query.tune) {
      Tune.findById(req.query.tune, function(err,tune) {
        if (err) throw err;
        renderForm(req,res,{data: {tune: tune}},'create-version');
      });
    } else {
      renderForm(req,res,{},'error');
    }
  });

  router.get('/:version_id', function(req, res) {
    get(req,res);
  });

  router.put('/:version_id', function(req, res) {
    update(req,res);
  });

  router.delete('/:version_id', function(req, res) {
    remove(req,res);
  });

  router.get('/upload/:version_id', function(req, res) {
    var id = req.params.version_id;
    if (id) {
      Version.findById(id, function(err,version) {
        if (err) throw err;
        renderForm(req,res,{data: version},'upload-version');
      });
    } else {
      renderForm(req,res,{},'error');
    }
  });

  router.get('/', function(req,res) {
    renderForm(req,res);
  });

  // This is an error handler for this router
  router.use(handleCSRF(renderForm));
 
  return router;
};