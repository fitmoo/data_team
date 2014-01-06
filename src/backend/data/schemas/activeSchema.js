var mongoose = require('mongoose');

var ActiveSchema = new mongoose.Schema({ 
	assetName : String,
	assetDescription : Array,
	activityStartDate: Date,
	activityEndDate : Date,
	place: { 
		addressLine1Txt : String,
		addressLine2Txt : String,
		cityName : String,
		stateProvinceCode : String,
		postalCode: String
	}, 
	assetPrices: [ { effectiveUntilDate : Date, priceAmt : Number}],
	
	registrationUrlAdr : String,
	contactEmailAdr : String,
	contactName : String,
	contactPhone : String
});

module.exports = ActiveSchema;