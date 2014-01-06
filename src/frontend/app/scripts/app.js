/* Global define */
define([
	// routes
	'routers/routes',
  'models/session',

	// views
	'views/layouts/mainLayout',
  'views/header/headerView',
  'views/sidebar/sidebarView',

	'backbone.marionette'
], function (
	AppRouter,
  Session,
  mainLayout,
	headerView,
	sidebarView
) {
  'use strict';

  var app = new Backbone.Marionette.Application();

  app.addInitializer(function () {
    // define views
    var MainLayout = new mainLayout();
    var HeaderView = new headerView();
    
    console.log('Render main layout');
    MainLayout.render();
    
    console.log('Render header view');
    MainLayout.header.show(HeaderView);

    var userInfo = Session.get('user');
    if (userInfo) {
      var SidebarView = new sidebarView({isDataEntry: userInfo.isDataEntry});
      console.log(SidebarView);
      // SidebarView.$el = $('div');
      console.log('Render sidebar view');
      SidebarView.render();
    }
    
  });

  return app;
});