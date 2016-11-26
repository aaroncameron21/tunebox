var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tuneSchema = new Schema({
    name: String,
    dateCreated: Date,
    dateModified: Date,
    versions: Array,
    description: String,
    tags: String,
    
});

tuneSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  // change the dateModified field to current date
  this.dateModified = currentDate;
  // if dateCreated doesn't exist, add to that field
  if (!this.dateCreated)
    this.dateCreated = currentDate;
  next();
});

var Tune = mongoose.model('Tune',tuneSchema);

module.exports = Tune;