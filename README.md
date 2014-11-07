Routn
-----
A simple JavaScript routing library based on History APIs

Features
---------
- routes based on hash or relative path 
	- hash enabled by default
	- if disabled, relative path will be used 
- intercepts link clicks on the document and route them
- update route context data in history
- option to skip history of mutating actions
- chained route handlers 
- external navigation

See [TODO](todos.js) for more sample code, and

[TODO List](http://tadessetdk.github.io/routn/todos.html) in action.

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
			var id = context.params.id;
			//delete todo using id
		} ]
	);
```
####manual navigation
	- use routn.navigateTo(url, data) to go to a route
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

####ignoring history for data mutating actions
	- pass false as second argument to register()
	- useful to keep actions such as add, delete... out of history

```javascript 
	routn.register(		
		["/todo/:id/delete", false, function(context){
			var id = context.params.id;
			//delete todo using id
		} ]
	);
```

####saving context data
	- this uses replaceState() history api 

```javascript 
	routn.register(		
		["/todo/:id/save", false, function(context){
			context.data = mynewdata;
			context.save();
		} ]
	);
```

####disable hash and use relative path instead
```javascript 
	routn.setup({ useHash: false })
```

####chaining route handlers
```javascript 
	routn.register(		
		["/todo/:id/delete", false, function(context, next){
			var id = context.params.id;
			//your code here
			next(); // will invoke the next handler below
			//...
		}, function(context){
			// called when next() is executed in a preceding handler
			//...
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
