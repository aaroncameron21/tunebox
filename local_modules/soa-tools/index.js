var ObjectID = require('mongodb').ObjectID;


exports.mongo = {};
exports.mongo.address = 'mongodb://localhost:27017/soa';
exports.mongo.mongoClient = null;
exports.mongo.db = null;

exports.mongo.initialize = function(req,res,next) {
    exports.mongo.mongoClient = req.mongoClient;
    next();
};

exports.mongo.connect = function(callback) {
    exports.mongo.mongoClient.connect(exports.mongo.address,function(err,db) {
        if (err) {throw err;}
        exports.mongo.db = db;
        callback();
    });
};

exports.mongo.find = function(collection,query,callback) {
    exports.mongo.db.collection(collection).find(query).toArray(function(err,results) {
        if (err) {throw err;};
        callback(results);
        return;
    });
};
exports.mongo.insert = function(collection,data,success,failure) {
    exports.mongo.db.collection(collection).insert(data).then(
        // ON PROMISE SUCCESS
        function(val) {
            if (val.insertedCount > 0) {
                success(val);
            } else {
                failure("Unknown error",val);
            }
        }, 
        // ON PROMISE REJECTION
        function(reason) {
            failure(reason);
        }
    );
};

exports.mongo.idIsValid = function(id) {
    return ObjectID.isValid(id);
};


exports.mongo.findById = function(collection,id,callback) {
    if (ObjectID.isValid(id)) {
        exports.mongo.db.collection(collection).find({_id: { $eq: ObjectID(id)}}).toArray(function(err,result) {
            if (err) {throw err;};
            callback(result[0]);
            return;
        });
    } else {
        console.log("db-tools error: id is undefined.");
        callback();
        return;
    }
};

exports.handleCSRF = function (render) {
    var r = function(err,req,res,next) {
        if (err.code === 'EBADCSRFTOKEN'){
        // The csurf library is telling us that it can't
        // find a valid token on the form
            if(req.user){
                // session token is invalid or expired.
                // render the form anyways, but tell them what happened
                render(req,res,{
                    errors:[{error:'Your form has expired.  Please try again.'}]
                });
            }else{
                // the user's cookies have been deleted, we dont know
                // their intention is - send them back to the home page
                res.redirect('/');
            }
        }else{
            // Let the parent app handle the error
            return next(err);
        }
    };
    return r;
};


exports.parseForm = function(req,form) {
  var setObject = {};
  try {
    setObject = JSON.parse(form.data.data);
  } catch (e) {
    console.log("Failed to parse sample data JSON object:",e);
    setObject = null;
  }
  return setObject;
}


