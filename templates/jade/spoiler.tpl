div(class="panel panel-default")
	div.panel-heading
		button(type="button", class="btn btn-default btn-xs", onclick="$(this).parent().next().collapse('toggle');")
			!= argument
	div(class="panel-collapse collapse out")
		div.panel-body
			!= value