var //FACILITY_WEBSITE_REGEX = "href=\"(.*)\"",
	FACILITY_WEBSITE_REGEX = 'href="(.*)" ',
	FACILITY_LOCATION = "<br />(.*)<br />(.*)<br />(.*)",
	ERROR_MESSAGE = 'map.crossfit.com changed data format.',
	NEW_LINE = '/\r?\n|\r/';

module.exports = {

	//Parse html string and return facility properties:
	//Facility Website
	//Facility Name
	//Facility Address
	//City
	//State
	//Phone
	parseHTML : function(html){

		var returnObj = {};
		websites = html.match(FACILITY_WEBSITE_REGEX);
		facilityName = html.match("<a.*>(.*)</a>");
		places = html.split('<br />');
		
		if (websites && websites.length === 2)
			returnObj.websiteURL  = websites[1];	

		
		if (facilityName && facilityName.length === 2)
			returnObj.facilityName = facilityName[1];

		len = places.length;
		if (len >= 1){
			returnObj.address  = places[1];
			if (len >= 2){
				temp = places[2].split(",");
				returnObj.city = temp[0];
				returnObj.state = temp[1] && temp[1].trim();
				if (len >= 3)
					returnObj.phoneNumber = places[3];
			}
		}
		return returnObj;
	}
}
