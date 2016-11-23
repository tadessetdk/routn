Routn
-----
A simple JavaScript routing library based on hash or history APIs

Features
---------
- routes based on hash or history API 
	- hash enabled by default
	- if disabled, history will be used 
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

####constraining route parameters with regex
	- parametes are treated as string by default
	- use regex if you need to constraint them

```javascript 
	routn.register(		
		["/todo/:id/delete", false, { id: /\d+/ },  function(context){
			var id = context.params.id;
			//delete todo using id
		} ],

		["/todo/:id/delete/:history_id/view", 
				{ id: /\d+/, history_id: /^[a-z0-9]+$/i  },  function(context){

			var id = context.params.id;
			var historyId = context.params.history_id;
			....

		} ]
	);
```

####saving context data
	- use context.save(newData)
	- this uses replaceState() history api 

```javascript 
	routn.register(		
		["/todo/:id/save", false, function(context){
			...
			context.save(mynewdata);
			...
		} ]
	);
```

####disable hash and use history API instead
```javascript 
	routn.setup({ useHash: false })
```

####chaining route handlers
```javascript 
	routn.register(		
		["/todo/:id/delete", false, function(context, next){
			var id = context.params.id;
			//your code here
			next(); // will invoke the next handler in the pipeline
			//...
		}, function(context, next){
			// called when next() is executed in a preceding handler
			//...
		} ]
	);
```

####manual navigation
	- use routn.navigateTo(url, data) to go to a route
	- the data will be passed to the route handlers in the pipeline

```javascript 
	routn.navigateTo('/todos', todos);	
	...
	routn.register(		
		["/todos", function(context){
			var todos = context.data;
		} ]
	);
```

Support
-------
- IE10+, Chrome, Firefox, Opera, Safari

License
--------
(MIT License)

Copyright (c) 2014 Tadesse Feyissa <tadessedk@gmail.com>
