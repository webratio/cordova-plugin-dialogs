function createStubs() {
    
    var notifications = window.top.ripple && window.top.ripple('platform/cordova/2.0.0/bridge/notification');
    var alertFn = notifications && notifications.alert;
    var confirmFn = notifications && notifications.confirm;
    
    var audioContext = (function() {
        // Determine if the Audio API is supported by this browser
        var AudioApi = window.AudioContext;
        if (!AudioApi) {
            AudioApi = window.webkitAudioContext;
        }
        
        if (AudioApi) {
            // The Audio API is supported, so create a singleton instance of the
            // AudioContext
            return new AudioApi();
        }
        
        return undefined;
    }());
    
    var activityUI = new function () {
        var act = {};
        act.cancelable = false;
        
        act.activityElement = document.createElement("DIV");
        act.activityElement.id = "wr-activity-waiting";
        act.activityElement.style.background = "rgba(0, 0, 0, 0.5)";
        act.activityElement.style.position = "fixed";
        act.activityElement.style.width = "100%";
        act.activityElement.style.height = "100%";
        act.activityElement.style.zIndex = "10000";
        /* > Create div wrapper */
        act.div = document.createElement("DIV");
        act.div.style.background = "#000";
        act.div.style.padding = "10px";
        act.div.style.borderRadius = "5px";
        act.div.style.margin = "0 auto";
        act.div.style.width = "200px";
        act.div.style.maxWidth = "80%";
        act.div.style.color = "#fff";
        act.div.style.textAlign = "center";
        act.div.style.top = "50%";
        act.div.style.position = "relative";
        act.div.style.marginTop = "-30px";
        act.activityElement.appendChild(act.div);
        /* > Create title */
        act.title = document.createElement("DIV");
        act.title.style.fontWeight = "700";
        act.div.appendChild(act.title);
        /* > Create description */
        act.description = document.createElement("DIV");
        act.div.appendChild(act.description);
        
        
        act.setTitle = function(title) {
            act.title.innerHTML = title;
        }
        
        act.setDescription = function(description) {
            act.description.innerHTML = description;
        }
        
        act.setCancelable = function(cancelable) {
            act.cancelable = cancelable;
        }
        
        act.show = function (title, description, cancelable) {
            act.setTitle(title || "");
            act.setDescription(description || "");
            act.setCancelable(cancelable || false);
            if (!act.activityElement.parentNode) {
                document.body.appendChild(act.activityElement);
            }
        };
        act.hide = function () {
            if (act.activityElement.parentNode) {
                act.activityElement.parentNode.removeChild(act.activityElement);
            }
        };
        
        return act;
    };
    
    function log() {
        var args = [].slice.call(arguments, 0);
        args.unshift("[notification]");
        console.log.apply(console, args);
    }
    
    return {
        Notification : {
            alert : function(message, title, buttonLabel) {
                
                if (alertFn) {//Ripple Notifications.alert
                    if (title) {
                        message = title + "<br>" + message;
                    }
                    return alertFn(undefined, undefined, [message]);
                } else {
                    if (title) {
                        message = title + "\n" + message;
                    }
                    window.alert(message);
                }
            },
            
            confirm : function(message, title, buttonLabels) {
                
                if (confirmFn) {//Ripple Notifications.confirm
                    var promise = new Promise(function(resolve, reject) {
                        var callback = function(index) {resolve(index)}                                            
                        confirmFn(callback, undefined, [message, title, buttonLabels]);
                    });
                    
                    return promise;
                } else {
                    if (title) {
                        message = title + "\n" + message;
                    }
                    if (window.confirm(message)) {
                        return 1
                    } else {
                        return 2; // Cancel
                    }
                }
                
            },
            
            prompt : function(message, title, buttonLabels, defaultText) {
                if (title) {
                    message = title + "\n" + message;
                }
                var result = window.prompt(message, defaultText || '');
                
                if (result === null) {
                    return {
                        buttonIndex : 2,
                                input1 : ''
                    }; // Cancel
                } else {
                    return {
                        buttonIndex : 1,
                        input1 : result
                    }; // OK
                }
                
            },
            
            activityStart: function (title, description, cancelable) {
                activityUI.show(title, description, cancelable);                
            },
            
            activityStop: function () {
                activityUI.hide();
            },
            
            progressStart : function(title, message) {
                log("progressStart");
            },
            
            progressStop : function() {
                log("progressStop");
            },
            
            progressValue : function(value) {
                log("progressValue");
            },
            
            vibrate : function(success, error, args) {
                log("vibrate");
            },
            
            beep : function(times) {
                if (times > 0) {
                    var BEEP_DURATION = 700;
                    var BEEP_INTERVAL = 300;
                    
                    if (audioContext) {
                        // Start a beep, using the Audio API
                        var osc = audioContext.createOscillator();
                        osc.type = 0; // sounds like a "beep"
                        osc.connect(audioContext.destination);
                        osc.start(0);
                        
                        setTimeout(function() {
                            // Stop the beep after the BEEP_DURATION
                            osc.stop(0);
                            
                            if (--times > 0) {
                                // Beep again, after a pause
                                setTimeout(function() {
                                    navigator.notification.beep(times);
                                }, BEEP_INTERVAL);
                            }
                            
                        }, BEEP_DURATION);
                    } else if (typeof (console) !== 'undefined'
                            && typeof (console.log) === 'function') {
                        // Audio API isn't supported, so just write `beep` to
                        // the console
                        for (var i = 0; i < times; i++) {
                            log('Beep!');
                        }
                    }
                }
            }
        }
    };
};
