var async = require('async');

module.exports = {
	
	facilityService : null,
	classService : null,
	eventService : null,

	init: function(facilityService, classService, eventService){
		this.facilityService = facilityService;
		this.classService = classService;
		this.eventService = eventService;
	},

	getDashBoard : function(req, res){
		self = this;
		async.auto({
		    facility: function(callback){
		        self.facilityService.countTotal(callback);
		    },
		    events: [ 
		    	'facility',
			    function(callback){
			        self.eventService.countTotalByCondition( { assetParentGuid : { $exists: false } }, callback);
			    }
		    ],
		    classes: ['facility', 'events', 
		    	function(callback){
		        	self.classService.countTotal(callback);
		        }
		    ],
		    photo: ['facility', 'events', 'classes', 
		    	function(callback){
		    		self.facilityService.countTotalImages(callback);
		    	}
		    ],
		    video: ['facility', 'events', 'classes', 'photo',
		    	function(callback){
		    		self.facilityService.countTotalVideo(callback);
		    	}
		    ],
		    done: ['facility', 'events', 'classes', 'photo', 'video',
		    	function(callback, results){
		     		res.send(results);
		    	}
		    ]
		});
	}
}