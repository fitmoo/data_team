var page = require('webpage').create(),
    system = require('system');

var IMAGE = 'image';
var VIDEO = 'video';
var MEDIA = 'media'; //Both image and video

if (system.args.length === 3) {

    var url = system.args[1];
    var crawlType = system.args[2];
    page.settings.loadImages = false;
    page.settings.resourceTimeout = 1*60*1000;
    
    page.onError = function (msg, trace) {
        //
        system.stdout.write(JSON.stringify({message : msg}));
    }   
    //Crawl Image
    if (IMAGE === crawlType){
        page.open(url, function (status) {
            var pageResource = page.evaluate(function(){

                var returnObject = { videos : [], images : [], linkArray : [] };
                var imgs = document.getElementsByTagName('img'); 
                var links = document.getElementsByTagName('a');

                //Image url
                for (i = 0; i < imgs.length; i++) {
                    if (imgs[i].src && imgs[i].src !== '')
                        returnObject.images.push(imgs[i].src);
                }

                //Sub links
                for (i = 0; i < links.length; i++){
                    if (links[i].href && links[i].href !== '' && links[i].href.indexOf("/#") < 0)
                        returnObject.linkArray.push(links[i].href);
                }
                return returnObject;
            });
            
            system.stdout.write(JSON.stringify(pageResource));
            phantom.exit();
        });
    }
    //Crawl video
    else if (VIDEO === crawlType){
        page.open(url, function (status) {

            var pageResource = page.evaluate(function(){

                var returnObject = { videos : [], linkArray : [] };
                var links = document.getElementsByTagName('a');                
                var iframes = document.getElementsByTagName('iframe');
                var objects = document.getElementsByTagName('object');
                var youtubeDiv = document.getElementById('player-api');
                var relatedVideoContainer = document.getElementById('watch-related');
                
                var youtubeVideoLink = "www.youtube.com/watch?v=";
                var defaultLinkPre = "http://www.youtube.com/embed/";
                var defaultLinkSuff = "?feature=oembed";

                //Sub links
                for (var i = 0, len = links.length; i < len; i++){

                    if (links[i].href && links[i].href !== '' && links[i].href.indexOf("/#") < 0)
                        returnObject.linkArray.push(links[i].href);

                    //VideoLink
                    
                    var href = links[i].href;

                    if(href && href.indexOf(youtubeVideoLink) >= 0){
                        var matched = href.match("/\?v=(.*)");

                        if(matched && matched.length > 1){
                            returnObject.videos.push(defaultLinkPre + matched[1] + defaultLinkSuff);
                        }
                    }
                    
                }

                //Video link
                for (var i = 0, len = iframes.length; i < len; i++){

                    var src = iframes[i].src;
                    if (src.indexOf('vimeo.com') > 0 || src.indexOf('http://www.youtube.com') == 0)
                    {
                        var url = '';

                        //If vimeo
                        if(src.indexOf('vimeo.com') > 0){
                            url = src.replace("fallback?js", "");
                        }
                        else
                            url = src;

                        returnObject.videos.push(url);
                    }
                       
                }

                for (var i = 0, len = objects.length; i < len; i++){

                    var embed = objects[i].getElementsByTagName('embed');
                    var url = embed && embed.length > 0 && embed[0].src;

                    if (url && (url.indexOf('vimeo.com') > 0 || url.indexOf('youtube.com') > 0))
                        returnObject.videos.push(url);
                }

                //Video Link on youtube.com
                if(youtubeDiv){
                    var youtubeEmbed = youtubeDiv.getElementsByTagName("embed");

                    if(youtubeEmbed && youtubeEmbed.length > 0){
                        var innerHTML = youtubeDiv.innerHTML;
                        //&amp;loaderUrl=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D9qSGJb39wjg&amp;pltype=contentugc
                        //http://stackoverflow.com/questions/10567236/regex-to-match-the-first-occurrence-of-a-string
                        var matched = innerHTML.match("&amp;loaderUrl=(.*?)&amp;");
                        if(matched && matched.length == 2){
                            var encodeURL = matched[1].toString();
                            //Convert the url
                            var url = decodeURIComponent(encodeURL);
                            videoKey = url.match("v=(.*)");
                            if(videoKey && videoKey.length > 1){
                                returnObject.videos.push(defaultLinkPre + videoKey[1] + defaultLinkSuff);
                            }
                        }
                    }
                }
                //Get related link in youtube
                if(relatedVideoContainer){
                    var links = relatedVideoContainer.getElementsByTagName("a");
                    for(var i =0, len = links.length; i < len; i++){
                        var href = links[i].href;
                        if(href){
                            var videoKey = href.match("v=(.*)");

                            if(videoKey && videoKey.length > 1){
                                returnObject.videos.push(defaultLinkPre + videoKey[1] + defaultLinkSuff);
                            }
                        }
                    } 
                }

                


                return returnObject;
            });

            system.stdout.writeLine(JSON.stringify(pageResource));
            phantom.exit();
        });
    //Crawl all image and video
    } else if(MEDIA === crawlType){
        page.open(url, function (status) {
            var pageResource = { videos : [], images : [], linkArray : [] };;

            if(status === 'success'){
                    pageResource = page.evaluate(function(){

                    var returnObject = { videos : [], images : [], linkArray : [] };
                    var imgs = document.getElementsByTagName('img'); 
                    var links = document.getElementsByTagName('a');
                    var iframes = document.getElementsByTagName('iframe');
                    var objects = document.getElementsByTagName('object');
                    var youtubeDiv = document.getElementById('player-api');
                    var relatedVideoContainer = document.getElementById('watch-related');
                    
                    var youtubeVideoLink = "www.youtube.com/watch?v=";
                    var defaultLinkPre = "http://www.youtube.com/embed/";
                    var defaultLinkSuff = "?feature=oembed";

                    /*****************************************<IMAGES>*******************************************/
                    //Image url
                    for (i = 0; i < imgs.length; i++) {
                        if (imgs[i].src && imgs[i].src !== '')
                            returnObject.images.push(imgs[i].src);
                    }
                    /*****************************************</IMAGES>*******************************************/

                    /*****************************************<VIDEO>*******************************************/


                    //Video link
                    for (var i = 0, len = iframes.length; i < len; i++){

                        var src = iframes[i].src;
                        if (src.indexOf('vimeo.com') > 0 || src.indexOf('http://www.youtube.com') == 0)
                        {
                            var url = '';

                            //If vimeo
                            if(src.indexOf('vimeo.com') > 0){
                                url = src.replace("fallback?js", "");
                            }
                            else
                                url = src;

                            returnObject.videos.push(url);
                        }
                           
                    }

                    for (var i = 0, len = objects.length; i < len; i++){

                        var embed = objects[i].getElementsByTagName('embed');
                        var url = embed && embed.length > 0 && embed[0].src;

                        if (url && (url.indexOf('vimeo.com') > 0 || url.indexOf('youtube.com') > 0))
                            returnObject.videos.push(url);
                    }

                    //Video Link on youtube.com
                    if(youtubeDiv){
                        var youtubeEmbed = youtubeDiv.getElementsByTagName("embed");

                        if(youtubeEmbed && youtubeEmbed.length > 0){
                            var innerHTML = youtubeDiv.innerHTML;
                            //&amp;loaderUrl=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D9qSGJb39wjg&amp;pltype=contentugc
                            //http://stackoverflow.com/questions/10567236/regex-to-match-the-first-occurrence-of-a-string
                            var matched = innerHTML.match("&amp;loaderUrl=(.*?)&amp;");
                            if(matched && matched.length == 2){
                                var encodeURL = matched[1].toString();
                                //Convert the url
                                var url = decodeURIComponent(encodeURL);
                                videoKey = url.match("v=(.*)");
                                if(videoKey && videoKey.length > 1){
                                    returnObject.videos.push(defaultLinkPre + videoKey[1] + defaultLinkSuff);
                                }
                            }
                        }
                    }
                    //Get related link in youtube
                    if(relatedVideoContainer){
                        var links = relatedVideoContainer.getElementsByTagName("a");
                        for(var i =0, len = links.length; i < len; i++){
                            var href = links[i].href;
                            if(href){
                                var videoKey = href.match("v=(.*)");

                                if(videoKey && videoKey.length > 1){
                                    returnObject.videos.push(defaultLinkPre + videoKey[1] + defaultLinkSuff);
                                }
                            }
                        } 
                    }

                    /*****************************************</VIDEO>*******************************************/
                    

                    /*****************************************<Sub links>*******************************************/
                    
                    for (var i = 0, len = links.length; i < len; i++){

                        if (links[i].href && links[i].href !== '' && links[i].href.indexOf("/#") < 0)
                            returnObject.linkArray.push(links[i].href);

                        //VideoLink
                        
                        var href = links[i].href;

                        if(href && href.indexOf(youtubeVideoLink) >= 0){
                            var matched = href.match("/\?v=(.*)");

                            if(matched && matched.length > 1){
                                returnObject.videos.push(defaultLinkPre + matched[1] + defaultLinkSuff);
                            }
                        }
                        
                    }

                    /*****************************************</Sub links>*******************************************/

                    return returnObject;
                });
            }
            system.stdout.write(JSON.stringify(pageResource));
            phantom.exit();
        });

    }
    else{
        phantom.exit();
    }
} else{
    phantom.exit();
}
   


