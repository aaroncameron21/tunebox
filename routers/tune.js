var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var csurf = require('csurf');
var express = require('express');
var extend = require('xtend');
var forms = require('forms');
 
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
 
var mongo = require('soa-tools').mongo;
var parseForm = require('soa-tools').parseForm;
var handleCSRF = require('soa-tools').handleCSRF;


var Tune     = require('../models/tune');
var Version     = require('../models/version');


// Declare the schema of our form:
 
var form = forms.create({
  data: forms.fields.string({required: false})
});
 
function renderForm(req,res,locals,view){
  res.render(view || 'tune', extend({
    csrfToken: req.csrfToken(),
    partials: req.partials
  },locals||{}));
}

function remove(req,res) {
    Tune.remove({
      _id: req.params.tune_id
    },function(err,tune) {
      if (err) res.send(err);
      renderForm(req,res,{success: true, message: 'Tune deleted!', data: tune},'edit-tune');
    });
}

function create(req,res) {
    var tune = new Tune();
    tune.name = req.body.name;
    tune.description = req.body.description;
    tune.tags = req.body.tags.split(',');

    tune.save().then(
      function(val) {
        res.redirect("/tune/" + val._id);
        // renderForm(req,res,{success: true, message: 'Tune created!', data: val },'edit-tune');
      },
      function(reason) {
        renderForm(req,res,{success: false, errors: ['Tune creation failed! ' + reason]},'create-tune');
      }
    );
}

function get(req,res) {
  var id;
  if (id = req.params.tune_id) {
    Tune.findById(id, function(err, tune) {
      if (err) res.send(err);
      if (tune) {
        var data = tune.toObject();
        Version.find({tune: { $eq: id}}, function(err,versions) {
          if (err) throw err;
          data.versions = [];
          versions.forEach(function(version){data.versions.push(version);});
          console.log("Tune's versions:",data.versions);
          renderForm(req,res,{success: true, data: data},'edit-tune');
        });
      } else {
        renderForm(req,res,{success: false, errors: ['Tune not found!']},'edit-tune');
      }
    });
  } else {
      Tune.find(function(err,tunes) {
        if (err) res.send(err);
        renderForm(req,res,{success: true,data: tunes},'list-tunes');
      });
  }
}

function update(req,res) {
  Tune.findById(req.params.tune_id, function(err, tune) {
    if (err) res.send(err);
    tune.name = req.body.name || tune.name;
    tune.description = req.body.description || tune.description;
    tune.tags = req.body.tags ? req.body.tags.split(',') : tune.tags;
    tune.save().then(
      function(val) {
        renderForm(req,res,{success: true, message: 'Tune updated!', data: val },'edit-tune');
      },
      function(reason) {
        renderForm(req,res,{success: false, errors: ['Tune update failed! ' + reason]},'edit-tune');
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
  router.use(mongo.initialize);

  // router.use(function(req,res,next) {
  //   console.log("Body:",req.body);
  //   console.log("Params:",req.params);
  //   next();
  // })
 
  router.post('/', function(req, res) {
    create(req,res);
  });

  router.post('/:tune_id', function(req, res) {
      if (req.body.delete === 'true') {
        remove(req,res);
      } else {
        update(req,res);
      }
  });

  router.get('/', function(req, res) {
    renderForm(req,res,{},'create-tune');
  });

  router.get('/search', function(req, res) {
    get(req,res);
  });

  router.get('/:tune_id', function(req, res) {
    get(req,res);
  });

  router.put('/:tune_id', function(req, res) {
    update(req,res);
  });

  router.delete('/:tune_id', function(req, res) {
    remove(req,res);
  });


  // This is an error handler for this router
  router.use(handleCSRF(renderForm));
 
  return router;
};