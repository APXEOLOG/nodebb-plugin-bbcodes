div(class="panel panel-default", style="width: 50%;", id=id)
	div.panel-heading
			!= argument
	table.table
		!= value
	div.panel-footer
		a(href="#", class="btn btn-success btn-sm bbcodes-poll-vote", bbcodes-poll-id=id)
			| Vote