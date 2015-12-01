/**
 * jQuery lazyDequeue
 * A lightweight jQuery plugin to lazy load images with a background queue
 *
 * Licensed under the MIT license.
 * Copyright 2015 Valerio Mazza
 *
 */

;(function($) {

    $.fn.lazyDequeue = function(options) {
        var default_options = {
            threshold : 0,
            queueLength: 4,
            queueDelay: 500,
            callback: null
        };

        options = $.extend({}, default_options, options);

        var $w = $(window),
            th = options.threshold || 0,
            retina = window.devicePixelRatio > 1,
            attrib = retina? "data-src-retina" : "data-src",
            images = this,
            loaded;

        this.one("deQueue", function() {
            var source = this.getAttribute(attrib);
            source = source || this.getAttribute("data-src");
            if (source) {
                this.setAttribute("src", source);
                if (typeof options.callback === "function") callback.call(this);
            }
        });

        function lazyDequeue() {
            var inview = images.filter(function() {
                var $e = $(this);
                if ($e.is(":hidden")) return;

                var wt = $w.scrollTop(),
                    wb = wt + $w.height(),
                    et = $e.offset().top,
                    eb = et + $e.height();

                return eb >= wt - th && et <= wb + th;
            });
            loaded = inview.trigger("deQueue");
            images = images.not(loaded);
        }

        function start() {
            var loadedElements = new Array();

            var multiplier = 0;
            var index = 0;
            var imgSetLength = images.length;

            loaded.each(function(index, value){
                loadedElements.push(value.attr("data-src"));
            });

            for(var i = 0; i < imgSetLength; i++) {
                if(index >= options.queueLength) {
                    index = 0;
                    multiplier++;
                }

                var src = images[i].getAttribute("data-src");
                if (loadedElements.indexOf(src) == -1) {
                    loadedElements.push(src);
                    index++;
                }

                setTimeout(function() {
                    var loaded = images.first().trigger("deQueue");
                    images = images.not(loaded);
                }, options.queueDelay * multiplier + 10);
            }
        }

        if (options.queueLength > 0 || options.queueDelay != 0) {
            $w.on("scroll.deQueue resize.deQueue lookup.deQueue", lazyDequeue);
            lazyDequeue();
            start();
        } else {
            images.trigger("deQueue");
        }
        return this;
    };

})(window.jQuery || window.Zepto);
