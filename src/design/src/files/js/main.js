// Define maximum available item on side bar
var _windowInnerHeight = 0;
var _mainContainerHeight = 0;

$(document).ready(function(){

	// Init upload modal
	$('#myModal').modal({
		show: false
	});

	// Auto hide more button if sidebar is not full
	$('#btn-more').hide();

	// Apply bootstrap button plugin
	$('.btn').button();

	// Apply bootstrap tooltip plugin
	$('.bar').tooltip('show')

	// Handle view more button for left sidebar
	$('#btn-more').bind('click', function(e){
		e.preventDefault();

		var _this = $(this);

		if($('.m-sidebar-collapsed .nav li').length == 0) {
			return false;
		}

		if(_this.data('isShow') != undefined && _this.data('isShow')) {
			_this.data({isShow: false});
			$('.m-sidebar-collapsed').fadeOut(); return false;
		}

		_this.data({isShow: true});

		var _offset = $(this).find('img').offset();

		$('.m-sidebar-collapsed').css({
			'top': _offset.top - 15 - window.scrollY + 'px',
			'left': _offset.left + 60 + 'px'
		}).fadeIn();
	});

	// Handle add new calendar on edit page
	var calendar = $('#calendar');
	calendar.on('click', '#addItem-btn', function () {
		console.log('Show new calendar item');
		calendar.find('.calendar-form').show();
		calendar.find('#calendar-saved').hide();
		calendar.find('.add-calendar-item').show();
		calendar.find('.form-actions').show();
		calendar.find('.no-record').hide();
	});

	calendar.on('click', '#calendar-save-btn', function () {
		console.log('Save calendar');
		calendar.find('.form-actions').hide();
		calendar.find('#calendar-saved').show();
		calendar.find('.calendar-form').hide();
	});

	calendar.on('click', '.cancel-btn', function () {
		console.log('Save calendar');
		calendar.find('.form-actions').hide();
		calendar.find('.calendar-form').hide();
		calendar.find('#calendar-saved').hide();
		calendar.find('.no-record').show();
	});
	calendar.on('click', '#calendar-saved .btn', function() {
		calendar.find('.no-record').show();
		calendar.find('#calendar-saved').hide();
	});

	// Handle click edit button
	var editFacility = $('#facility-edit-form');
	var editFacilityWrapper = $('#editing-facility');

	editFacilityWrapper.on('click', '.page-header .btn', function() {
		editFacilityWrapper.addClass('editing');
	});
	editFacility.on('click', '.btn-primary', function() {
		editFacilityWrapper.removeClass('editing');
	});

	// show confirm popup when delete a facility/class/event
	var listData = $('.table-striped');
	listData.on('click', '.btn', function() {
		alert('Are you sure you wish to delete?');
	});

	// show advanced search
	var advancedSearch = $('#advanced-search');
	advancedSearch.on('click','.advanced-search', function() {
		advancedSearch.find('.popover').toggleClass('show');
	});

	// handle add activity
	var activities = $('#activities');
	var newActivity = $('#new-activity');
	var activityTpl = {
		MAIN: 
		'<tr>'+
			'<td>'+
				'<span class="data"></span>'+
				'<input type="textbox" class="input-xlarge facility-class">'+
			'</td>'+
			'<td class="align-right">'+
				'<span class="data"></span>'+
				'<input type="textbox" class="input-xlarge facility-class align-right">'+
			'</td>'+
		'</tr>',
		NEW:
		'<tr>'+
			'<td>'+
				'<input type="textbox" class="facility-class">'+
			'</td>'+
			'<td class="align-right">'+
				'<input type="textbox" class="facility-class align-right">'+
			'</td>'+
		'</tr>'
	};
	activities.on('click', '.add-btn', function() {
		activities.find('tbody').append(activityTpl.MAIN);
	});
	activities.on('click', '.add-new', function() {
		activities.find('tbody').append(activityTpl.NEW);
	});
	activities.on('click', '.add-new', function() {
		activities.find('tbody').append(activityTpl.NEW);
	});

	// handle show accoutn settings popup
	// var accountSettings = $('#account-settings-popup');
	// accountSettings.on('click','.modal-header .btn', function() {
	// 	accountSettings.addClass('editing');
	// });
	// accountSettings.on('click','.modal-footer .btn-primary', function() {
	// 	accountSettings.removeClass('editing');
	// });

	// get window inner height
	_windowInnerHeight = $(window).innerHeight();
	// get init main container height
	_mainContainerHeight = $('.main-container').innerHeight();

	function updateMainContainerHeight() {
		// Try to update main container height with available browser height
		if($('.sidebar').innerHeight() > _mainContainerHeight) {
			$('.main-container').css({
				height: $('.sidebar').innerHeight()
			});
		} else {
			$('.main-container').css({
				height: 'auto'
			});
		}
	}

	$(window).bind('resize', function(e){

		updateMainContainerHeight();

		$('.m-sidebar-collapsed').fadeOut();
		$('#btn-more').data({isShow: false});

		
		if($(window).innerWidth() <= 768) {
			pushSideBarItem($('.m-sidebar-collapsed .nav li').length);
			return false;
		}

		var _itemsCount = ($(window).innerHeight() - 60) / 76;
			_itemsCount = parseInt(_itemsCount, 10);

		// Get current sidebar length
		var _currSideBarLength = $('.sidebar .nav li').length;

		if(_itemsCount < 2 ) {
			_itemsCount = 2;
		}

		if(_currSideBarLength == _itemsCount) {
			return false;
		}


		if(_currSideBarLength > _itemsCount) {
			// Pop out
			popSideBarItem(_currSideBarLength - _itemsCount);
		} else {
			// Push in
			pushSideBarItem(_itemsCount - _currSideBarLength);
		}

		$('#btn-more').toggle($('.m-sidebar-collapsed .nav li').length > 0);

		if(_currSideBarLength == _itemsCount) {
			return false;
		}
	}).trigger('resize');

	function popSideBarItem(items) {

		_currSideBar = $('.sidebar .nav li');

		for(var i = _currSideBar.length - 2, iCount = 0; iCount < items; i--,iCount++){
			$('.m-sidebar-collapsed .nav').prepend(_currSideBar[i]);
		}
	}

	function pushSideBarItem(items) {
		_collapseSideBar = $('.m-sidebar-collapsed .nav li');

		for(var i = 0, iCount = 0; iCount < items; i++, iCount++) {
			$('#btn-more').parents('li').before(_collapseSideBar[i]);
		}
	}
});