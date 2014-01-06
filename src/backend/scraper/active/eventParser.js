var _ = require('underscore');

//Parse event properties from active.com to Fitmoo concept
module.exports = {

	parse : function(obj){
		copy = {};
		copy.eventName = obj.assetName;
		copy.eventDescription = _.chain(obj.assetDescriptions)
								.map(function(item){
									return item.description;
								})
								.reduce(function(memo, des){
									return memo.concat('\r\n', des);
								})
								.value();
		copy.startDateTime = obj.activityStartDate;
		copy.endDateTime = obj.activityEndDate;
		copy.timezone = obj.place.timezone;
		copy.timezoneDST = obj.place.timezoneDST;
		copy.address1 = obj.place.addressLine1Txt;
		copy.address2 = obj.place.addressLine2Txt;
		copy.city = obj.place.cityName;
		copy.stateProvinceCode = obj.place.stateProvinceCode;
		copy.country = obj.place.countryName;
		copy.registrationSiteURL = obj.registrationUrlAdr;
		copy.hostEmail = obj.contactEmailAdr;
		copy.hostName = obj.contactName;
		copy.hostPhone = obj.contactPhone;
		return copy;
	},

	parseArray : function(objArray){
		var pickArray = _.map(objArray, function(eventItem){
								return {
									_id : eventItem.assetGuid.replace(/-/g, ''),
									assetGuid : eventItem.assetGuid,
									assetParentGuid : eventItem.assetParentAsset && eventItem.assetParentAsset.assetGuid,
									eventPrice : _.chain(eventItem.assetPrices)
													.map(function(assetPrice){ 
															return {effectiveUntilDate : assetPrice.effectiveUntilDate, price : assetPrice.priceAmt};
														})
													.reject(function(assetPrice){ return !assetPrice.effectiveUntilDate && (!assetPrice.priceAmt || assetPrice.priceAmt == 0)})
													.value(),
									eventName : eventItem.assetName,
									eventDescription : eventItem.assetDescriptions.length == 0 ? [] : _.chain(eventItem.assetDescriptions)
															.map(function(item){
																return item.description ;
															})
															.reduce(function(memo, des){
																return memo.concat('\r\n', des);
															})
															.value(),
									activities : _.chain(eventItem.assetComponents)
													.map(function(activity){
														return {
															_id : activity.assetGuid.replace(/-/g, ''),
															name : activity.assetName,
															startDate : activity.activityStartDate,
															endDate : activity.activityEndDate,
														}
													})
													.value(),
									//[ { {effectiveUntilDate : {type: Date, default: null}, name: String, price: Number} ],
									startDateTime : eventItem.activityStartDate,
									endDateTime : eventItem.activityEndDate,
									timezone : eventItem.place.timezone,
									timezoneDST : eventItem.place.timezoneDST,
									address1 : eventItem.place.addressLine1Txt,
									address2 : eventItem.place.addressLine2Txt,
									city : eventItem.place.cityName,
									stateProvinceCode : eventItem.place.stateProvinceCode,
									postalCode : eventItem.place.postalCode,
									country : eventItem.place.countryName,
									registrationSiteURL : eventItem.registrationUrlAdr,
									hostEmail : eventItem.contactEmailAdr,
									hostName : eventItem.contactName,
									hostPhone : eventItem.contactPhone
								}
						});
		return pickArray;
	}
}