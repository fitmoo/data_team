var _ = require('underscore'),
	ArrayProto = Array.prototype,
	concat = ArrayProto.concat,
	slice = ArrayProto.slice;

_.mixin({
  pickNested: function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    _.each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  },
  //Copy item's property in Array items
  pickArray: function(objs){
    var copy = [];
    if (_.isArray(objs) ){
      var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
      _.each(objs, function(obj) {
        copy.push(_.pick(obj, keys));
      });
    }
    return copy;
  }


});