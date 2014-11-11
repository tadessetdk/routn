(function(){

	routn.register([
		["*", log ],

		["/", log],

		["/products", log ],

		["/product/:id", log ],

		["/product/:id/*", log ],

		["/product/:id/edit", { id: /\d+/ }, false /* do not add to history, good for update operations*/, log ],

		["/product/:id/edit/:history_id/history", { id: /\d+/, history_id: /^[a-z0-9]+$/i }, false /* do not add to history, good for update operations*/, log ],

		["/product/:id/save", false /* do not add to history */, function(ctx, route, next){

			log(ctx, route);

			var d = products[ctx.params.id];
			
			if(d){
				d.rank = 7;
				ctx.save(d);
			}

			next();

		}, function(ctx){
			//console.log('/product/:id/save - route detected');
			//console.log("context updated", ctx.data);
		}],	

		["/products/add", false /* do not add to history */, function(ctx, route, next){

			log(ctx, route);
			//console.log("add view displayed");

			next();
			
		}, function(ctx){

			//console.log('/product/:id/add - route detected');
			ctx.save({ id: 5, cost: 34.9, rank: 1, timestamp: new Date() });
			//console.log("product added", ctx.data);

		}],		

		["/products/*", log ],	

		["/product/*", log ],		

		["/products/#sort/asc", log ],		

		["/products#merge", log ]	
	]);

	function log(ctx, route, next){
		console.log('%s - routed to - %s', ctx.url, route);
	}

    var products = [
    				{ id: 1, cost: 34.9, rank: 6, timestamp: new Date() },
    				{ id: 2, cost: 9, rank: 5, timestamp: new Date() },
    				{ id: 3, cost: 54, rank: 2, timestamp: new Date() },
    				{ id: 4, cost: 123, rank: 10, timestamp: new Date() }
    			];

	routn.navigateTo('/products', products);
	routn.navigateTo('/product/3/edit', products);
	routn.navigateTo('/product/scott/edit', products);
	routn.navigateTo('/product/3/edit/2/history', products);
	routn.navigateTo('/product/sam/edit/2/history', products);
	routn.navigateTo('/product/3/edit/burg/history', products);
	routn.navigateTo('/product/joe/edit/black/history', products);
	routn.navigateTo('/product/5', products);
	routn.navigateTo('/products/add');
	routn.navigateTo('/product/add');
	routn.navigateTo('/products/add/x');
	routn.navigateTo('/products/added/x');
	routn.navigateTo('/products/add/x');
	routn.navigateTo('/product/2/save');
	routn.navigateTo('/product/john/save');
	routn.navigateTo('/products/sort/asc');
	routn.navigateTo('/products/merge');
	routn.navigateTo('#products/add');

})();