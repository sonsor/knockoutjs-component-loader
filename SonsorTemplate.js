(function() {
    'use strict';

    function SonsorTemplate(name, options) {
        if (this.templates[name]) return '';

        this.templates[name] = 1;

        this.promise = this.getPromise();

        var config = {
            jsLoaded: false,
            htmlLoaded: false,
            callback: options.onload || false,
            promise: this.promise
        };

        ko.components.register(name, {
            template: {
                params: options,
                onload: config
            },
            viewModel: {
                params: options,
                onload: config
            }
        });
    }

    SonsorTemplate.prototype.templates = {};

    SonsorTemplate.loadedJs = {};

    SonsorTemplate.prototype.getPromise = function() {
        var promise = {};
        promise.promise = new Promise(function(resolve) {
            promise.resolve = resolve;
        });
        promise.then = function(callback) {
            promise.promise.then(callback);
        }
        return promise;
    };

    SonsorTemplate.prototype.ready = function(callback) {
        this.promise.then(callback);
    };

    SonsorTemplate.onLoad = function(config) {
        if (config.htmlLoaded && config.jsLoaded) {
            config.callback ? config.callback() : '';
            config.promise.resolve();
        }
    }

    SonsorTemplate.render = function(name, config, callback) {
        callback(function(params, component) {
            var viewModel = eval(config.params.viewModelName) || {};
            if (typeof(viewModel) == 'function') {
                viewModel = new viewModel();
            }

            for (var field in params) {
                switch (field) {
                    case '$import':
                        for (var importField in params[field]) {
                            viewModel[importField] = params[field][importField];
                        }
                    break;
                    case '$data-bind':
                        var nodes = componentInfo.element.childNodes;
                        for (var i = 0; i < nodes.length; i++) {
                            if (nodes[i].nodeType === 1) {
                                nodes[i].setAttribute('data-bind', params[field]);
                            }
                        }
                    break;
                    default:
                        viewModel[field] = params[field];
                    break;
                }
            }

            if (viewModel._init) {
                viewModel._init(componentInfo.element);
            }

            return viewModel;
        })
    }

    ko.components.loaders.unshift({
        loadTemplate: function(name, config, callback) {
            if (config.params && config.params.html) {
                var httpRequest = new XMLHttpRequest();
                httpRequest.onreadystatechange = function() {
                    try {
                        if (httpRequest.readyState === XMLHttpRequest.DONE) {
                            if (httpRequest.status === 200) {
                                var container = document.createElement('div');
                                container.innerHTML = httpRequest.responseText;
                                callback(container.childNodes);
                                config.onload.htmlLoaded = true;

                                //_templateIsReady(templateConfig.onload);
                                container.style.display = 'none';
                                document.body.appendChild(container);
                                SonsorTemplate.onLoad(config.onload);
                            } else {
                                alert('There was a problem with the request');
                            }
                        }
                    } catch (e) {
                        console.log(e); // jshint ignore:line
                        alert('Caught Exception: ' + e.description);
                    }
                };
                httpRequest.open('GET', config.params.html);
                httpRequest.send();
            }
        },
        loadViewModel: function(name, config, callback) {
            if (config.params) {
                var jsFilesCount = 0;
                var jsFiles = config.params.js || [];
                var numberOfJsLoaded = 0;

                if (jsFiles.length === 0) SonsorTemplate.reder(name, config, callback);
                
                jsFiles.forEach(function(jsFile) {
                    if (!SonsorTemplate.loadedJs[jsFile]) {
                        SonsorTemplate.loadedJs[jsFile] = true;
                        var script = document.createElement('script');
                        script.src = jsFile;

                        script.onload = function() {
                            if (++numberOfJsLoaded == jsFiles.length) {
                                SonsorTemplate.render(name, config, callback);
                            }
                        };
                        document.querySelector('head').appendChild(script);
                    }
                }, this);
                if (jsFiles.length === numberOfJsLoaded + 1) {
                    config.onload.jsLoaded = true;
                }

                SonsorTemplate.onLoad(config.onload);
            } else {
                callback(null);
            }
        }
    });

    window.SonsorTemplate = SonsorTemplate;

})();