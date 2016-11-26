var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
    name: String,
    dateCreated: Date,
    dateModified: Date,
    tracks: Array,
    description: String,
    tags: String,
});

projectSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  // change the dateModified field to current date
  this.dateModified = currentDate;
  // if dateCreated doesn't exist, add to that field
  if (!this.dateCreated)
    this.dateCreated = currentDate;
  next();
});

var Project = mongoose.model('Project',projectSchema);

module.exports = Project;