//Written by Tadesse D. Feyissa. Oct 28, 2014.

var routn = (function(){

	window.onpopstate = function(e){
		handlePathChange(e);
	}

	window.onhashchange = function(e){
		if(isIE()) handlePathChange(e);
	}

	window.onclick = function(e){
		
		//intercept relative links and route them locally
		//do not use document.location for routing instead use routn.navigateTo(url, stateData)

		var destUrl = e.target ? e.target.href : null;
		if(destUrl){
			
			var path = destUrl.replace(document.location.origin, ''); 

			//IE hash click in the document links does not trigger onhashchange event
			var hashIndex = path.indexOf('#');	
			var hasHash =  hashIndex !== -1;
			
			if((isIE() && hasHash)){							
				path = '/' + path.substring(hashIndex + 1);	
				navigatePropagate(e, path, true);			
			} else if(!hasHash) {				
				navigatePropagate(e, path);	
			}
			
		}

	}

	function navigatePropagate(e, path, propagate){

		if(/^\/.*$/.test(path)) {

			if(!propagate){
				e.preventDefault();
				if(e.stopImmediatePropagation) e.stopImmediatePropagation();
				if(e.stopPropagation) e.stopPropagation();
				if(e.cancelBubble) e.cancelBubble = true;
			}

			routn.navigateTo(path, e.state);

		}

	}
	
	function isIE(){
		var userAgent = window.navigator.userAgent;
	    return userAgent.indexOf('MSIE ') != -1 || userAgent.indexOf('Trident/') != -1;
	}

	function handlePathChange(e){
		var path = document.location.pathname;

		if(routn.useHashForRouting){

			if(document.location.hash){
				path = document.location.hash.substring(1);
			}else{
				console.log('useHashForRouting is set, but no hash found for routing.')
			}
			
		}

		var context = new routeContext(path, e.state || {});
		transitionTo(context, routn.routes);
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

	var routeContext = function(url, data){
		this.url = url;
		this.data = data;
		this.params = null;
	};

	routeContext.prototype.save = function(data){
		this.data = data;
		window.history.replaceState(this.data, null, this.url);
		return this;
	};

	routeContext.prototype.create = function(url, data){
		this.url = url;
		this.data = data;
		window.history.pushState(this.data, null, this.url);
		return this;
	};

	function parseRoute(url, routes){			

		var match = matchRoute(url, routes);					
		return match ? routes[match.route] : null;

	}	

	function matchRoute(url, routes){

		if(!url) return null;

		//get non-empty segments
		var parts = getUrlParts(url);

		//find exact match
		var match = findMatch(routes, parts);
		if(match) return match;

		//else find a generic match
		while(parts.length){
		
			parts[parts.length - 1].name = '*';
			match = findMatch(routes, parts);	

			if(match) return match;

			parts.splice(parts.length - 1, 1);

		}	

		return null;	

	}
 
	function findMatch(routes, searchParts) {
				
		var matches = [];

		for (var i in routes) {
		 	if(routes[i].parts.length === searchParts.length){
		 		matches.push(routes[i]);
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

	function isValidRoute(routes, newRoute){

		if(!newRoute || !newRoute.trim(' ')){
			console.log("Empty route is not allowed; use * instead");	
			return false;			
		}

		if(routes[newRoute]){
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
	
	function getRouteHandlers(handlers){

		return handlers.filter(function(hnd, i) { 
			return i && (typeof(hnd) === 'function')
		});

	}	

	function transitionTo(context, routes){

		var route = parseRoute(context.url, routes);

		if(route){
			context.params = route.params;
			executeHandler(route.handlers, context, 0);
		}

	}

	return {

		useHashForRouting: true,

		routes: {}, 

		navigateTo: function(url, data){

			var context = new routeContext();
			context.create(url, data);
			transitionTo(context, this.routes);

		},

		register: function(routesIn){

			routesIn = (routesIn instanceof Array) ? routesIn : (Array.prototype.slice.apply(arguments));

			if(!routesIn || !routesIn.length){
				console.log("No routes found");
				return;
			}

			var len = routesIn.length;
		
			for (var i = 0; i < len; i++) {

				var newRoute = routesIn[i][0];

				if(!isValidRoute(this.routes, newRoute)) {
					continue;				
				}

				this.routes[newRoute] = new route
				(
					newRoute, 
					getUrlParts(newRoute), 
					getRouteHandlers(routesIn[i])
				);

			}

		}	

	};

})();