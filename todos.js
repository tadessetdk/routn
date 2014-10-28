//Written by Tadesse D. Feyissa. Oct 28, 2014.

//==================================================================
//		TODO-List Example
//==================================================================

$(function(){

	// model_section_begin

	var INCOMPLETE = "INCOMPLETE", DONE = "DONE";

	var todo = function(id, name, status){
		this.id = id;
		this.name = name;
		this.status = status || INCOMPLETE;
	};

	var todos = [
		new todo(1, 'Code review', INCOMPLETE),
		new todo(2, 'TechEd code complete', DONE),
		new todo(3, 'Release-4.12', INCOMPLETE)
	];

	var sortedByInfo = { name: null, ascending: true };

	// model_section_end

	// routing_section_begin

	routn.register([
		["*", function() { 

			console.log('* - route detected');

		} ],

		["/todos", function(ctx){

			console.log('/todos - route detected');

			$('#txtTodo').val('');
			renderTodosView(ctx.data);

		} ],
	
		["/todo/:id/delete", function(ctx){

			console.log('/todo/:id/delete - route detected');

			var pos = -1;
			var result = todos.some(function(t) {
				pos++;
				return t.id == ctx.params.id;
			});

			pos = result ? pos : -1;

			if(pos >= 0){
				todos.splice(pos, 1);
				routn.navigateTo('/todos', todos);
			}
			
		} ],

		["/todos/add", function(ctx, next){

			console.log('/todos/add - route detected');

			var val = $('#txtTodo').val().trim();

			if(val){
				val = val.charAt(0).toUpperCase() + val.substring(1); 
				todos.push(new todo(todos.length + 1 , val));
				next();
			}
			
		}, function(ctx){
			
			routn.navigateTo('/todos', todos);

		}],		

		["/todo/:id/toggle", function(ctx, next){

			console.log('/todo/:id/toggle - route detected');

			var items = todos.filter(function(t) { return t.id == ctx.params.id;});	
			if(items.length){		
				var d = items[0];
				d.status = d.status == INCOMPLETE ? DONE : INCOMPLETE;
				ctx.save(d);			
				next();
			}

		}, function(ctx){
			updateStatusView(ctx.data);			
		}],	

		["todos/sort/:column", function(ctx){

			console.log('/todos/sort - route detected');

			var column = ctx.params.column;
			var count = -1, key = null;
			
			for(var name in new todo){
				if(++count == column){
					key = name;
					break;
				}
			}

			var ascending = sortedByInfo.name == key ? !sortedByInfo.ascending : true;

			todos = todos.sort(function(x, y){
				var t1 = ascending ? x : y;
				var t2 = ascending ? y : x;
				return t1[key] > t2[key] ? 1 : (t1[key] < t2[key] ? -1 : 0);
			});

			//save sorting state
			sortedByInfo.name = key;
			sortedByInfo.ascending = ascending;

			renderTodosView(todos);

		}]	

	]);
	
	// routing_section_end

	// view_section_begin

	function updateStatusView(todo){
		$('#row-' + todo.id).find('td:last-child').html(todo.status)
			.end().find(':checkbox').trigger('click');
	}   

	function renderTodosView(data){
		var tmpl = Handlebars.compile($('#todos-template').html());
		$('#todos-table').html(tmpl({todos: data}));
	}

	function enableAddButton(hasContent){
		$('#btnAdd').prop('disabled', !hasContent);
	}

	function enableChangeButtons(isChecked){
		$('.change-buttons :button').prop('disabled', !isChecked);
	}

	function showChangeButtons(show){
		$('.change-buttons').css('display', show ? 'block' : 'none');
	}

	// event_listeners_begin

	$('#btnAdd').on('click', function(){		
		routn.navigateTo('/todos/add');
		showChangeButtons($(':checkbox').length);
		enableAddButton(false);
	});

	$('#txtTodo').on('keypress', function(e){
		enableAddButton($(this).val().trim().length >= 3);
		if((e.keyCode || e.which) === 13){
		 	$('#btnAdd').trigger('click');
		}
	});
	
	$('tbody').on('change', ':checkbox', function(){
		enableChangeButtons($(this).is(':checked'));
		
		if($('tr.highlight-row').attr('id') != $(this).closest('tr').attr('id')){
			$('tr.highlight-row').find(':checkbox').prop('checked', false)
				.end().removeClass('highlight-row');
		}
			
		$(this).closest('tr').toggleClass('highlight-row');
	});

	$('#btnDelete').on('click', function(){
		var id = $(':checkbox:checked').closest('tr').attr('id').substring(4);
		routn.navigateTo('/todo/' + id + '/delete');
		
		if(!$(':checkbox').length) showChangeButtons(false);
		enableChangeButtons($(':checkbox:checked').length);
	});

	$('#btnToggleStatus').on('click', function(){
		var id = $(':checkbox:checked').closest('tr').attr('id').substring(4);
		routn.navigateTo('/todo/' + id + '/toggle');
	});

	// event_listeners_end

	// view_section_end

	// start the app
	routn.navigateTo('/todos', todos);	

});