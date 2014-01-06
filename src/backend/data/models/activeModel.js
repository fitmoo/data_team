var mongoose = require('mongoose'),
	ActiveSchema = require('../schemas/activeSchema'),
	Active = mongoose.model('Active', ActiveSchema); 

module.exports = Active;