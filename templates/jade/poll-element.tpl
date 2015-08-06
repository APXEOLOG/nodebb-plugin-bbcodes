tr
	td(style="width: 7%;")
		input(type="radio",name="poll-name")
	td(style="width: 45%;")
		strong 
			!= value
	td
		div.progress(style="margin-bottom: 0px;")
			div.progress-bar(role="progressbar", aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;")
				span(style="display: block; position: absolute; width: 90%;")
					| Progress Value