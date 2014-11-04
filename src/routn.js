//Written by Tadesse D. Feyissa. Oct 28, 2014.

var routn = (function(){

	"use strict";

	window.onpopstate = function(e){
		handlePathChange(e);
	}

	window.onhashchange = function(e){
		if(isIE()) handlePathChange(e);
	}

	window.onclick = function(e){
		
		//intercept relative links and route them locally
		//do not use document.location for routing instead use routn.transitionTo()

		var destUrl = e.target ? e.target.href : null;
		if(destUrl){
			
			//IE hash click in the document links does not trigger onhashchange event
			var result = getRoutePath(destUrl); 
			
			if(result){

				if((isIE() && result.hasHash)){							
					navigatePropagate(e, destUrl, result.path, true);			
				} else if(!result.hasHash) {				
					navigatePropagate(e, destUrl, result.path);	
				}

			}
			
		}

	}

	function getRoutePath(url){

		if(!url || !url.trim()) return null;

		var path = url.replace(document.location.origin, ''); 
		var hashIndex = -1;

		if(useHashForRouting){

			hashIndex = path.indexOf('#');			

			if(hashIndex !== -1){
				path = path.substring(hashIndex + 1);	
			}

		}

		var hasHash =  hashIndex !== -1;
		if(!hasHash){
			var queryIndex = path.indexOf('?');
			if(queryIndex !== -1){
				path = path.substring(0, queryIndex);
			}
		}

		return { path: path, hasHash: hasHash };
	}

	function navigatePropagate(e, url, path, propagate){

		if(/^\/.*$/.test(path)) {

			if(isIgnoreHistory(path)) propagate = false;

			if(!propagate){
				e.preventDefault();
				if(e.stopImmediatePropagation) e.stopImmediatePropagation();
				if(e.stopPropagation) e.stopPropagation();
				if(e.cancelBubble) e.cancelBubble = true;
			}

			transitionTo(url, path, e.state);

		}

	}
	
	function isIE(){
		var userAgent = window.navigator.userAgent;
	    return userAgent.indexOf('MSIE ') != -1 || userAgent.indexOf('Trident/') != -1;
	}

	function handlePathChange(e){
		var path = document.location.pathname;

		if(useHashForRouting){

			if(document.location.hash){
				path = document.location.hash.substring(1);
			}
			
		}

		var context = new routeContext(document.location.href, path, e.state || {});
		transition(context);
	}

	var route = function(route, parts, handlers){
		 this.route = route;
		 this.parts = parts;
		 this.handlers = handlers;
	};

	var routePart = function(name, type){
		this.name = name;
		this.type = type;
	};

	var routeContext = function(url, path, data){
		this.path = path;
		this.url = url;
		this.data = data;
		this.params = null;
	};

	routeContext.prototype.save = function(data){
		this.data = data;

		if(!isIgnoreHistory(this.path)){
			window.history.replaceState(this.data, null, this.url);
		}
	};

	routeContext.prototype.create = function(url, path, data){
		this.url = url;
		this.path = path;
		this.data = data;
		
		if(!isIgnoreHistory(this.path)){
			window.history.pushState(this.data, null, this.url);
		}
	};

	function isIgnoreHistory(url) {
		var match = parseRoute(url);
		return match && routesWithoutHistory[match.route];
	}

	function parseRoute(url){			

		var match = matchRoute(url);					
		return match ? registeredRoutes[match.route] : null;

	}	

	function matchRoute(url){

		if(!url) return null;

		//get non-empty segments
		var parts = getUrlParts(url);

		//find exact match
		var match = findMatch(parts);
		if(match) return match;

		//else find a generic match
		while(parts.length){
		
			parts[parts.length - 1].name = '*';
			match = findMatch(parts);	

			if(match) return match;

			parts.splice(parts.length - 1, 1);

		}	

		return null;	

	}
 
	function findMatch(searchParts) {
				
		var matches = [];

		for (var i in registeredRoutes) {
		 	if(registeredRoutes[i].parts.length === searchParts.length){
		 		matches.push(registeredRoutes[i]);
		 	}
		}

		var len = matches.length;
		
		for (var i = 0; i < len; i++) {

			var itemsParts = matches[i].parts;
			var partsLen = itemsParts.length;

			for (var j = 0; j < partsLen; j++) {

				var item = itemsParts[j];

				if((item.type === 'path' && item.name !== searchParts[j].name) || 
					(searchParts[j].type === 'path' && item.type === 'id')){

					break;

				}

			}

			if (j === partsLen) {
				return getMatchInfo(matches[i], searchParts);
			}			
		}

		return null;
	}

	function getMatchInfo(match, searchParts){
	
		var slen = searchParts.length;
		var params = {};

		for(var k = 0; k < slen; k++){

			if(match.parts[k].type === 'id'){
				params[match.parts[k].name] = searchParts[k].name;
			}

		}

		match.params = params;
		return match;

	}

	function isValidRoute(newRoute){

		if(!newRoute || !newRoute.trim(' ')){
			console.log("Empty route is not allowed; use * instead");	
			return false;			
		}

		if(registeredRoutes[newRoute]){
			console.log(newRoute, " route is already registerd");				
			return false;
		}

		return true;

	}

	function getUrlParts(url){

		if(!url) return null;

		var segments = url.split('/').filter(function(s){ return s && s.trim(' ') });

		var len = segments.length;
		var parts = [];

		for (var i = 0; i < len; i++) {

			var item = segments[i].trim(' ');
			var part = new routePart();
			part.name = item.replace(':', '').toLowerCase();
			var isId = !(item.indexOf(':') === -1 && isNaN(item));
			part.type = isId ? 'id' : 'path';
			parts.push(part);

		}

		return parts;

	}

	function executeHandler(handlers, context, index){

		if(!handlers || index >= handlers.length) return;

		handlers[index++].call(null, context, function(){
			executeHandler(handlers, context, index);
		}); 

	}
	
	function getRouteHandlers(handlers, ignoreHistory){

		var startIndex = ignoreHistory ? 1 : 0;

		return handlers.filter(function(hnd, i) { 
			return (i > startIndex) && (typeof(hnd) === 'function')
		});

	}	

	function transitionTo(url, path, data){

		var context = new routeContext();
		context.create(url, path, data);
		transition(context);

	}

	function transition(context){

		var route = parseRoute(context.path);

		if(route){
			context.params = route.params;
			executeHandler(route.handlers, context, 0);
		}

	}

	function parseIgnoreHistory(route, keepHistory){

		if((typeof keepHistory === 'boolean') && !keepHistory){
			return (routesWithoutHistory[route] = true);
		}

		return false;

	}	

	var useHashForRouting = true,
		registeredRoutes = {}, 
		routesWithoutHistory = {};

	return {

		setup: function(options) {

			var useHash = options.useHash || true;
			useHashForRouting = useHash == undefined ? true : useHash;
			return this;
			
		},

		navigateAway: function(url){

			document.location.href = url;
			return this;

		},

		navigateTo: function(url, data){

			var path = getRoutePath(url).path;
			transitionTo(url, path, data);
			return this;

		},

		register: function(){

			var routesIn = (arguments && arguments[0] && (arguments[0][0] instanceof Array)) ? arguments[0] : (Array.prototype.slice.apply(arguments));

			if(!routesIn || !routesIn.length){
				console.log("No routes found");
				return;
			}

			var len = routesIn.length;
		
			for (var i = 0; i < len; i++) {

				var newRoute = routesIn[i][0];

				if(!isValidRoute(newRoute)) {
					continue;				
				}

				registeredRoutes[newRoute] = new route
				(
					newRoute, 
					getUrlParts(newRoute), 
					getRouteHandlers(
						routesIn[i], 
						parseIgnoreHistory(newRoute, routesIn[i][1])
					)
				);

			}

			return this;

		}	

	};

})();