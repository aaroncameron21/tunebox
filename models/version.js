var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Tune     = require('./tune');

var versionSchema = new Schema({
    number: String,
    dateCreated: Date,
    dateModified: Date,
    description: String,
    tempo: Number,
    key: String,
    tune: String,
    file: Boolean
});

versionSchema.methods.findTune = function(callback) {
  Tune.findById(this.tuneId, function(err, tune) {
    callback(err,tune);
  });
};

versionSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  // change the dateModified field to current date
  this.dateModified = currentDate;
  // if dateCreated doesn't exist, add to that field
  if (!this.dateCreated)
    this.dateCreated = currentDate;
  next();
});

var Version = mongoose.model('Version',versionSchema);

module.exports = Version;