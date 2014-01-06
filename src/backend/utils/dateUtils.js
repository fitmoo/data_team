////////////////////////////////////////////////////////////////
//Date Time functions



module.exports = {
	dayOfWeek: {
		"1" : "sunday",
		"2" : "monday",
		"3" : "tuesday",
		"4" : "wednesday",
		"5" : "thursday",
		"6" : "friday",
		"7" : "saturday",

	},

	getCurrentTime : function(){
		var date = new Date();
		return date.toTimeString();
	},

	addMins: function(mins){
		var currentDate = new Date();
		currentDate.setMinutes(currentDate.getMinutes() + mins);
		return new Date(currentDate);
	},

	addDates: function(days){
		var currentDate = new Date();
		currentDate.setDate(currentDate.getDate() + days);
		return new Date(currentDate);
	},

	getDayOfWeek: function(index){
		return this.dayOfWeek[index];
	},

	getCurrentDateString: function(){
		var d = new Date();
    	var curr_date = d.getDate();
    	var curr_month = d.getMonth();
    	var curr_year = d.getFullYear();
    	return curr_year + "-" + curr_month + "-" + curr_date;
	},

	getDateNextYearString: function(){
		var d = new Date();
		var curr_date = d.getDate();
    	var curr_month = d.getMonth();
    	var curr_year = d.getFullYear() + 1;
    	return curr_year + "-" + curr_month + "-" + curr_date;
	}	
}
