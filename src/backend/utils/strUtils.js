/**
 * Provide some util functions for string manipulation
 */

module.exports = {
    /**
     * Get local ip address
     */
    firstUppercase: function (str) {
        return str.slice(0,1).toUpperCase() + str.slice(1);
    },

    escapeHtml: function (unsafe) {
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    },

    reseveEscapeHtml: function (unsafe) {
        return unsafe
             .replace("&amp;", "&")
             .replace("&lt;", "<")
             .replace("&gt;", ">")
             .replace("&quot;", '"')
             .replace("&#039;", "'");
    },

    removeHTMLTag: function(str){
        if(str){
            var regex = /(<([^>]+)>)/ig;
            return str.replace(regex, "");
        } else return '';

    }
}