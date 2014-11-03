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
		new todo(2, 'Deployment verification', DONE),
		new todo(3, 'Release 1.1.0.2', INCOMPLETE)
	];

	var sortedByInfo = { name: null, ascending: true };

	// model_section_end

	// routing_section_begin

	routn.register([
		["*", function(ctx) { 

			addLog(ctx.url);

		} ],

		["/todos", function(ctx){

			addLog(ctx.url);

			$('#txtTodo').val('');
			renderTodosView(ctx.data);

		} ],
	
		["/todo/:id/delete", false, function(ctx){

			addLog(ctx.url, true);

			var pos = -1;
			todos.some(function(t) {
				pos++;
				return t.id == ctx.params.id;
			});

			if(pos >= 0){
				todos.splice(pos, 1);
				routn.navigateTo('/todos', todos);
			}
			
		} ],

		["/todos/deletemany", false, function(ctx, next){

			addLog(ctx.url, true);
			
			ctx.data.forEach(function(id) {
			
				var pos = -1;
			    todos.some(function(t) { 
			   		pos++;
			   		return t.id == id
			   	});

			    if(pos >= 0){
					todos.splice(pos, 1);
				}
			   
			});	

			next();

		}, function(){
			renderTodosView(todos);			
		}],	

		["/todos/add", false, function(ctx, next){

			addLog(ctx.url, true);

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

			addLog(ctx.url);

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

		["/todos/togglemany", function(ctx, next){

			addLog(ctx.url);
			
			todos.forEach(function(t) {
			   if(ctx.data.some(function(id) { return t.id == id }) ){
			   		t.status = t.status == INCOMPLETE ? DONE : INCOMPLETE;
			   }
			});	

			next();

		}, function(){
			renderTodosView(todos);			
		}],	

		["/todos/sort/:column", function(ctx){

			addLog(ctx.url);

			var column = ctx.params.column;
			var count = -1, key = null;
			
			for(var name in new todo){
				if(++count == column){
					key = name;
					break;
				}
			}

			var ascending = sortedByInfo.name == key ? !sortedByInfo.ascending : true;

			todos.sort(function(x, y){
				var t1 = ascending ? x : y;
				var t2 = ascending ? y : x;
				return t1[key] > t2[key] ? 1 : (t1[key] < t2[key] ? -1 : 0);
			});

			//save sorting state
			sortedByInfo.name = key;
			sortedByInfo.ascending = ascending;

			renderTodosView(todos);

		}],		

		["/todos/completeall", function(ctx, next){

			addLog(ctx.url);
			
			ctx.data.forEach(function(t){
				t.status = DONE;
			});

			next();

		}, function(ctx){

			renderTodosView(ctx.data);			

		}],		

		["/todos/clear", function(ctx){

			addLog(ctx.url);
			renderTodosView(todos);			
			
		}],

		["/logs/clear", function(ctx){

			addLog(ctx.url);
			clearLogs();		
			
		}]

	]);
	
	// routing_section_end

	// view_section_begin

	function addLog(route, ignoreHistory) {
		console.log(route);
		$('<div class="log ' + (ignoreHistory ? 'not-saved' : '') + '"/>').html(route)
			.prependTo($('#logs-container'));
		$('#logs-section').fadeIn().css({display: 'inline-block'});
	}

	function clearLogs(){
		$('#logs-container').html('');
		$('#logs-section').fadeOut().css({display: 'none'});

	}

	function updateStatusView(todo){
		$('#row-' + todo.id).find('td:last-child').html(todo.status)
			.end().find(':checkbox').trigger('click');
	}   

	function renderTodosView(data){
		var tmpl = Handlebars.compile($('#todos-template').html());
		$('#todos-table').html(tmpl({todos: data}));
		$('#chkAll').prop('checked', false).trigger('change');
	}

	function enableAddButton(hasContent){
		$('#btnAdd').prop('disabled', !hasContent);
	}

	function showSelectionChangeButtons(){
		if($('tbody :checkbox:checked').length){
			$('.selection-change-button').fadeIn().css('display', 'inline');
		} else {
			$('.selection-change-button').fadeOut().css('display', 'none');
		}
	}

	function showChangeButtons(){
		if($('tbody :checkbox').length){
			$('.change-buttons').fadeIn().css('display', 'block');
		} else {
			$('.change-buttons').fadeOut().css('display', 'none');
		}
	}

	function getSelectedIds(){
		return $('tbody :checkbox:checked').closest('tr').map(function(i, el){ return el.id.substring(4); }).get();
	}

	// event_listeners_begin

	$('#chkAll').on('change', function(){
		$('tbody :checkbox').prop('checked', $(this).is(':checked')).trigger('change');
	});

	$('#btnAdd').on('click', function(){		
		routn.navigateTo('/todos/add');
		showChangeButtons();
		enableAddButton(false);
	});

	$('#txtTodo').on('keypress', function(e){
		enableAddButton($(this).val().trim().length >= 3);
		if((e.keyCode || e.which) === 13){
		 	$('#btnAdd').trigger('click');
		}
	});
	
	$('tbody').on('change', ':checkbox', function(){
		showSelectionChangeButtons();
		$(this).is(':checked') ? ($(this).closest('tr').addClass('highlight-row')) 
							: ($(this).closest('tr').removeClass('highlight-row'));
		$('#chkAll').prop('checked', !($('tbody :checkbox:not(:checked)').length));
	});

	$('#btnDelete').on('click', function(){
		var ids = getSelectedIds();
		if(!ids || !ids.length) return;

		var route = ids.length > 1 ? '/todos/deletemany' : '/todo/' + ids[0] + '/delete';
		routn.navigateTo(route, ids);
		
		showChangeButtons();
		showSelectionChangeButtons();
	});

	$('#btnToggleStatus').on('click', function(){
		var ids = getSelectedIds();
		if(!ids || !ids.length) return;

		var route = ids.length > 1 ? '/todos/togglemany' : '/todo/' + ids[0] + '/toggle';
		routn.navigateTo(route, ids);

		showChangeButtons();
		showSelectionChangeButtons();
	});

	$('#lnkCompleteAll').on('click', function(e){
		//will not work, navigates away; use routn.navigateTo('/todos/completeall');
		//document.location.href = document.location.origin +'/todos/completeall';
		routn.navigateTo('/todos/completeall', todos);
	});

	$('#lnkClearSelection').on('click', function(e){
		document.location.href = '#/todos/clear';
	});	

	// event_listeners_end

	// view_section_end

	// start_app_begin

	routn.navigateTo('/todos', todos);	

	// start_app_end

});