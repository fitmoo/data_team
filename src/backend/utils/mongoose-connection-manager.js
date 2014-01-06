var _ = require('underscore'),
    mongoose = require('mongoose'),
    db = mongoose.connection,
    isConnected = false,
    isConnecting = false,
    fnQueue = [];

module.exports = {
    connect: function (connectionString, fn) {
        fnQueue.push(fn);
        if (isConnecting) {
            return;
        } else {
            isConnecting = true;
        }

        if (!isConnected) {
            mongoose.connect(connectionString);
            db.once('open', function callback () {
                isConnecting = false;
                isConnected = true;
                _.each(fnQueue, function (oneFn) {
                    oneFn && oneFn();
                });
            });
        } else {
            fn && fn();
        }
    },
    
    disconnect: function () {
        if (isConnected){
            fnQueue = [];
            mongoose.disconnect();
            isConnected = false;
            isConnecting = false;
        }
    }
}