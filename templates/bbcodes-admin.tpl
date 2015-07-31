<div class="row">
	<script>
		$(document).ready(function() {
			require(['admin/settings'], function(settings) {
				settings.prepare();
			});
		});
	</script>
	<div class="col-lg-9">
		<div class="panel panel-default">
			<div class="panel-body">
				<form class="form-horizontal" id="int-steam-cpl-form">
					<fieldset>
						<!-- Form Name -->
						<legend>BBCodes Settings</legend>
						<!-- Text input-->
						<div class="well">
							<h2>Basic settings</h2>			
							<div class="form-group" style="margin-left: 0px;">
								<div class="checkbox">
									<label>
										<input type="checkbox" data-field="bbcodes-sanitize"> <b>HTML Sanitize</b>
										<span class="help-block">BBCodes module will sanitize input to prevent HTML/JS injection</span>
									</label>
								</div>
							</div>
						</div>
					</fieldset>
				</form>
			</div>
		</div>
	</div>
	<div class="col-lg-3">
		<div class="panel panel-default">
			<div class="panel-heading">Actions</div>
			<div class="panel-body">
				<button class="btn btn-primary btn-md" id="save">Save Changes</button>
				<button class="btn btn-warning btn-md" id="revert">Revert Changes</button>
			</div>
		</div>
	</div>
</div>