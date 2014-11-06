Routn
-----
A simple JavaScript routing library based on History APIs

Features
---------
- routing based on relative path or hash (optional) 
- intercepts link clicks on the document and route them
- save route context data in history
- option to skip history of mutating actions
- chained route handlers 
- external navigation

See [TODO](todos.js) example for more details.

Dependencies
------------
- routn.js does not have any dependency

Usage
-----

####registering routes

```javascript 
	routn.register(
		["*", function(context) { 
			console.log('route not found.')
		} ],

		["/todos", function(context){
			//list your todos here...
		} ],
	
		["/todo/:id/delete", false, function(context){
			var id == context.params.id;
			//delete todo using id
		} ]
	);
```
####navigate using javascript 
	- use **routn.navigateTo(url, data)** to go to a route
	- the data will be passed to the route handlers

```javascript 
	routn.navigateTo('/todos', todos);	
	...
	routn.register(		
		["/todos", function(context){
			var todos = context.data;
		} ]
	);
```

####ignoring history for actions that modify your data model
	- pass **false** boolean value as second argument when registering the route
	- helpful if you don't want to add actions such as add, delete... to history	

```javascript 
	routn.register(		
		["/todo/:id/delete", false, function(context){
			var id == context.params.id;
			//delete todo using id
		} ]
	);
```

####saving context data
	- this uses **replaceState** history api 

```javascript 
	routn.register(		
		["/todo/:id/save", false, function(context){
			context.data = mynewdata;
			context.save();
		} ]
	);
```

####opt-out of hash (use only relative paths). it is enabled by default.
```javascript 
	routn.setup({ useHash: false })
```

####chainable route handlers
```javascript 
	routn.register(		
		["/todo/:id/delete", false, function(context, next){
			var id == context.params.id;
			//delete todo using id
			next();
		}, function(context){
			// this will called when next() is executed.
			// render your view here...
		} ]
	);
```

Support
-------
- IE10+, and latest browsers

License
--------
(MIT License)

Copyright (c) 2014 Tadesse Feyissa <tadessedk@gmail.com>
