div(class="panel panel-default", ajax-spoiler-id=id)
	div.panel-heading
		button(type="button", class="btn btn-default btn-xs btn-ajx-spoiler")
			!= argument
		i(class="ajax-spoiler-spin fa fa-spinner fa-spin hidden", style="margin-left: 15px;")
		i(class="ajax-spoiler-error fa fa-times hidden", style="margin-left: 15px;")
	div(class="panel-collapse collapse out")
		div.panel-body
			!= value