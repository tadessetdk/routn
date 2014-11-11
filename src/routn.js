//Written by Tadesse D. Feyissa.

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

		if(isEmpty(url)) return null; 

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

	var routePart = function(name, type, constraint){
		this.name = name;
		this.type = type;
		this.constraint = constraint;
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

		if(isEmpty(url)) return null;

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

			var routeParts = matches[i].parts;
			var partsLen = routeParts.length;

			for (var j = 0; j < partsLen; j++) {

				var part = routeParts[j];

				if((part.type === 'path' && part.name !== searchParts[j].name) 
					|| failConstraint(part, searchParts[j])){
					break;
				}

			}

			if (j === partsLen) {
				return getMatchInfo(matches[i], searchParts);
			}			
		}

		return null;
	}

	function failConstraint(routePart, searchPart){
		return routePart.type === 'id' && 
				routePart.constraint && 
				routePart.constraint[routePart.name] && 
				!routePart.constraint[routePart.name].test(searchPart.name);
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

		if(isEmpty(newRoute)){
			console.log("Empty route is not allowed; use * instead");	
			return false;			
		}

		if(registeredRoutes[newRoute]){
			console.log(newRoute, " route is already registerd");				
			return false;
		}

		return true;

	}

	function getUrlParts(url, constraint){

		if(isEmpty(url)) return null;

		var segments = url.split('/').filter(function(s){ return !isEmpty(s) });

		var len = segments.length;
		var parts = [];

		for (var i = 0; i < len; i++) {

			var item = segments[i].trim();
			var part = new routePart();
			part.name = item.replace(':', '').toLowerCase();
			var isId = item.indexOf(':') !== -1;
			part.type = isId ? 'id' : 'path';
			part.constraint = constraint;
			parts.push(part);

		}

		return parts;

	}
	
	function getRouteHandlers(handlers, startIndex){
		
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
			executeHandler(route.handlers, context, route.route, 0);
		}

	}

	function executeHandler(handlers, context, route, index){

		if(!handlers || index >= handlers.length) return;

		var args = [context, function(){
			executeHandler(handlers, context, route, index);
		}];

		var handler = handlers[index++];

		if(handler.length > 2){
			args.splice(1, 0, route);
		}

		handler.apply(null, args); 

	}

	function setIgnoreHistory(route, keepHistory){

		if(!keepHistory){
			routesWithoutHistory[route] = true;
		}

	}	

	function getRegisterArgs(routeInfo){
		
		var keepHistory = true, constraint;

		if(!!routeInfo){

			var arg1 = routeInfo[1],
				arg1Type = typeof(arg1);

			if(arg1Type === 'object'){

				constraint = arg1;

			} else if(arg1Type === 'boolean'){

				keepHistory = arg1;

			}

			if(routeInfo.length > 2){

				var arg2 = routeInfo[2],
					arg2Type = typeof(arg2);

				if(arg2Type === 'object') {

					constraint = arg2;

				} else if(arg2Type === 'boolean'){

					keepHistory = arg2; 

				}

			}

		}

		return  { keepHistory: keepHistory, constraint: constraint };

	}

	function isEmpty(input){
		return !(input && input.trim());
	}

	function setup(options) {

		var useHash = options.useHash || true;
		useHashForRouting = useHash == undefined ? true : useHash;
		return this;
		
	}

	function navigateAway (url){

		if(isEmpty(url)) return; 

		document.location.href = url;
		return this;

	}

	function navigateTo(url, data){

		if(isEmpty(url)) return; 

		if(useHashForRouting && url.charAt(0) !== '#'){
			url = '#' + url;
		} 

		var path = getRoutePath(url).path;
		transitionTo(url, path, data);

		return this;

	}

	function register(){

		var routesIn = (arguments && arguments[0] && (arguments[0][0] instanceof Array)) 
						? arguments[0] 
						: (Array.prototype.slice.apply(arguments));

		if(!routesIn || !routesIn.length){
			console.log("No routes found");
			return;
		}

		var len = routesIn.length;
	
		for (var i = 0; i < len; i++) {

			var currentRoute = routesIn[i];
			var newRoute = currentRoute[0];

			if(!isValidRoute(newRoute)) {
				continue;				
			}

			var args = getRegisterArgs(currentRoute);
			setIgnoreHistory(newRoute, args.keepHistory);

			var index = -1;
			while((index < currentRoute.length - 1) && (typeof currentRoute[++index]) !== 'function');

			registeredRoutes[newRoute] = new route
			(
				newRoute, 
				getUrlParts(newRoute, args.constraint), 
				getRouteHandlers(currentRoute, index - 1)
			);

		}

		return this;

	}	

	var useHashForRouting = true,
		registeredRoutes = {}, 
		routesWithoutHistory = {};

	return new function(){		
		if(!(window.history && window.history.pushState && window.history.replaceState && window.onpopstate)){
			var _this = this;
			this.setup = this.navigateAway = this.navigateTo = this.register = function(){ return _this };
			console.log("routn works only with browsers that support HTML5 history APIs");			
		} else {
			this.setup = setup.bind(this);
			this.navigateAway = navigateAway.bind(this);
			this.navigateTo = navigateTo.bind(this);
			this.register = register.bind(this);		
		}
	};

})();