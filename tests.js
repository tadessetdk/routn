(function(){

	routn.register([
		["*", function(ctx) { 
			console.log('%s - route detected', ctx.url);
		} ],

		["/", function(ctx){
			console.log('%s - route detected', ctx.url);
		} ],

		["/products", function(ctx){
			console.log('%s - route detected', ctx.url);
		} ],

		["/product/:id", function(ctx){
			console.log('%s - route detected', ctx.url);
		} ],

		["/product/:id/*", function(ctx){
			console.log('%s - route detected', ctx.url);
		} ],

		["/product/:id/edit", false /* do not add to history, good for update operations*/, function(ctx){
			console.log('%s - route detected', ctx.url);
		} ],

		["/product/:id/save", false /* do not add to history */, function(ctx, next){

			console.log('%s - route detected', ctx.url);
			var d = products[ctx.params.id];
			d.rank = 7;
			ctx.save(d);
			next();

		}, function(ctx){
			//console.log('/product/:id/save - route detected');
			//console.log("context updated", ctx.data);
		}],	

		["/product/add", false /* do not add to history */, function(ctx, next){

			console.log('%s - route detected', ctx.url);
			//console.log("add view displayed");
			next();
			
		}, function(ctx){

			//console.log('/product/:id/add - route detected');
			ctx.save({ id: 5, cost: 34.9, rank: 1, timestamp: new Date() });
			//console.log("product added", ctx.data);

		}],		

		["/product/*", function(ctx){
			console.log('%s - route detected', ctx.url)
		}],		

		["/products/#sort/asc", function(ctx){
			console.log('%s - route detected', ctx.url)
		}],		

		["/products#merge", function(ctx){
			console.log('%s - route detected', ctx.url)
		}]	
	]);

    var products = [
    				{ id: 1, cost: 34.9, rank: 6, timestamp: new Date() },
    				{ id: 2, cost: 9, rank: 5, timestamp: new Date() },
    				{ id: 3, cost: 54, rank: 2, timestamp: new Date() },
    				{ id: 4, cost: 123, rank: 10, timestamp: new Date() }
    			];

	routn.navigateTo('/products', products);
	routn.navigateTo('/product/3/edit', products);
	routn.navigateTo('/product/5', products);
	routn.navigateTo('/product/add');
	routn.navigateTo('/product/add/x');
	routn.navigateTo('/product/added/x');
	routn.navigateTo('/products/add/x');
	routn.navigateTo('/product/2/save');
	routn.navigateTo('/products/#/sort/asc');
	routn.navigateTo('/products/#/merge');

})();