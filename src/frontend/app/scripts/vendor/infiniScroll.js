// Created by Jonathan Eatherly, (https://github.com/joneath)
// MIT license
// Version 0.3

(function() {
  Backbone.InfiniScroll = function(collection, options) {
    options = options || { };

    var self = { },
        $target,
        fetchOn,
        page,
        pageSize,
        prevScrollY = 0;

    pageSize = collection.length || 25;

    self.collection = collection;
    self.options = _.defaults(options, {
      success: function(){ },
      error: function(){ },
      onFetch: function(){ },
      target: $(window),
      param: "until",
      extraParams: {},
      pageSizeParam: "page_size",
      untilAttr: "page",
      pageSize: pageSize,
      scrollOffset: 100,
      remove: false,
      strict: false,
      includePage: false
    });

    var initialize = function() {
      $target = $(self.options.target);
      fetchOn = true;
      page = 1;

      $target.on("scroll", self.watchScroll);
    };

    self.destroy = function() {
      $target.off("scroll", self.watchScroll);
    };

    self.enableFetch = function() {
      fetchOn = true;
    };

    self.disableFetch = function() {
      fetchOn = false;
    };

    self.onFetch = function() {
      self.options.onFetch();
    };

    self.fetchSuccess = function(collection, response) {
      console.log(collection, response.photos);
      // if ((self.options.strict && collection.length >= (page + 1) * self.options.pageSize) || (!self.options.strict && response.photos.length > 0)) {
      if (response.totalRecords >= (page + 1) * self.options.pageSize) {
        // self.enableFetch();
        // collection.add(response.photos);
        // console.log(collection,page);
        // page += 1;
      } else {
        self.disableFetch();
      }
      self.options.success(collection, response.photos);
    };

    self.fetchError = function(collection, response) {
      self.enableFetch();

      self.options.error(collection, response.photos);
    };

    self.watchScroll = function(e) {

      var queryParams,
          scrollY = $target.scrollTop() + $target.height(),
          docHeight = $target.get(0).scrollHeight;
      if (!docHeight) {
        docHeight = $(document).height();
      }
      if (window.location.href.split('#')[1] === 'photos') {
        if (docHeight - scrollY <= 0) {
          self.deleteModels();
          if (!self.collection.checking  && self.collection.nextPage.photos.length > 0) {
            self.collection.checking = true;
            var backDrop = $('#backdrop'),
                indicator = $('#indicator');

            backDrop.show();
            indicator.show();

            var checking = setInterval(function() {
              if (self.collection.onLoadingProgress) {
                backDrop.hide();
                indicator.hide();
                self.collection.checking = false;
                // if (scrollY >= docHeight - self.options.scrollOffset && fetchOn && prevScrollY <= scrollY) {
                $(window).scrollTop(30);
                var lastModel = self.collection.last();
                if (!lastModel) { return; }

                self.onFetch();
                self.disableFetch();
                // console.log(self.collection.page);
                self.collection.reset(self.collection.nextPage.photos);
                // self.collection.fetch({
                //   success: self.fetchSuccess,
                //   error: self.fetchError,
                //   remove: self.options.remove,
                //   data: $.extend(buildQueryParams(lastModel, collection), self.options.extraParams)
                // });
                prevScrollY = scrollY;
                clearInterval(checking);
              }
            }, 1000);
          }
        }
      }
    };

    self.deleteModels = function() {
      var imagePicker = $('#photo-selection'),
          deletedPhotos = imagePicker.val();
              
      if (deletedPhotos || self.collection.putLastestId) {
        var firstPhotoId = self.collection.first().id,
            lastPhotoId = self.collection.last().id,
            data = {
              deletedPhotos: deletedPhotos,
              latestPhoto: lastPhotoId,
              firstPhoto: firstPhotoId
            };
            
        if (firstPhotoId) {
          console.log('Delete photos viewed:', data, lastPhotoId);
          self.collection.putLastestId = false;
          self.options.api.put('photos?token=' + self.options.token, data, function(res) {
           imagePicker.removeAttr('value');
           self.collection.remove(res);
           imagePicker.imagepicker();
          });
        }
      }

    };

    function buildQueryParams(model) {
      var params = { };

      params[self.options.param] = typeof(model[self.options.untilAttr]) === "function" ? model[self.options.untilAttr]() : model.get(self.options.untilAttr);
      params[self.options.pageSizeParam] = self.options.pageSize;

      if (self.options.includePage) {
        collection.page = collection.page+1;
        params["page"] = collection.page;
      }

      return params;
    }

    initialize();

    return self;
  };
})( );