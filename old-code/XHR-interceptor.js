/* Modified from the gist created by Andrew Newdigate. */

(function () {

    (function (XHR) {
        "use strict";

        var stats = [];
        var timeoutId = null;

        var open = XHR.prototype.open;
        var send = XHR.prototype.send;

        XHR.prototype.open = function (method, url, async, user, pass) {
            this._url = url;
            open.call(this, method, url, async, user, pass);
        };

        XHR.prototype.send = function (data) {
            var self = this;
            var start;
            var oldOnReadyStateChange;
            var url = this._url;

            function onReadyStateChange() {
                if (self.readyState == 4 /* complete */) {
                    var time = new Date() - start;
                    stats.push({
                        url: url,
                        duration: time
                    });

                    if (!timeoutId) {
                        timeoutId = window.setTimeout(function () {
                            var xhr = new XHR();
                            xhr.noIntercept = true;
                            xhr.open("POST", "/clientAjaxStats", true);
                            xhr.setRequestHeader("Content-type", "application/json");
                            xhr.send(JSON.stringify({ stats: stats }));

                            timeoutId = null;
                            stats = [];
                        }, 2000);
                    }
                }

                if (oldOnReadyStateChange) {
                    oldOnReadyStateChange();
                }
            }

            if (!this.noIntercept) {
                start = new Date();

                if (this.addEventListener) {
                    this.addEventListener("readystatechange", onReadyStateChange, false);
                } else {
                    oldOnReadyStateChange = this.onreadystatechange;
                    this.onreadystatechange = onReadyStateChange;
                }
            }

            send.call(this, data);
        }
    })(XMLHttpRequest);


    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = xhrInterceptor;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return xhrInterceptor;
        });
    } else {
        this.xhrInterceptor = xhrInterceptor;
    }

}).call(function () {
    return this || (typeof window !== 'undefined' ? window : global);
}());

