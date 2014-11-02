//Written by Tadesse D. Feyissa. Oct 28, 2014.

//======================
//		test cases
//======================

(function(){

	routn.register([
		["*", function(ctx) { 
			console.log(ctx.url,  ' - route detected');
		} ],

		["/", function(ctx){
			console.log(ctx.url,  ' - route detected');
		} ],

		["/products", function(ctx){
			console.log(ctx.url,  ' - route detected');
		} ],

		["/product/:id", function(ctx){
			console.log(ctx.url,  ' - route detected');
		} ],

		["/product/:id/*", function(ctx){
			console.log(ctx.url,  ' - route detected');
		} ],

		["/product/:id/edit", function(ctx){
			console.log(ctx.url,  ' - route detected');
		} ],

		["/product/:id/save", function(ctx, next){

			console.log(ctx.url,  ' - route detected');
			var d = products[ctx.params.id];
			d.rank = 7;
			ctx.save(d);
			next();

		}, function(ctx){
			//console.log('/product/:id/save - route detected');
			//console.log("context updated", ctx.data);
		}],	

		["/product/add", function(ctx, next){

			console.log(ctx.url,  ' - route detected');
			//console.log("add view displayed");
			next();
			
		}, function(ctx){

			//console.log('/product/:id/add - route detected');
			ctx.save({ id: 5, cost: 34.9, rank: 1, timestamp: new Date() });
			//console.log("product added", ctx.data);

		}],		

		["/product/*", function(ctx){
			console.log(ctx.url,  ' - route detected')
		}],		

		["/products/#sort/asc", function(ctx){
			console.log(ctx.url,  ' - route detected')
		}],		

		["/products#merge", function(ctx){
			console.log(ctx.url,  ' - route detected')
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
	routn.navigateTo('/products/#sort/asc');
	routn.navigateTo('/products/#merge');

})();