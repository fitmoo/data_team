var mongoose = require('mongoose'),
    ExportEventSchema = require('../schemas/exportEventSchema'),
    ExportEvent = mongoose.model('ExportEvent', ExportEventSchema); 

module.exports = ExportEvent;