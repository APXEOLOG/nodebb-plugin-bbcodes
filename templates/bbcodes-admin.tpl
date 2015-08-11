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
		<div class="panel panel-default">
			<div class="panel-heading">Compatibility Checks</div>
			<div class="panel-body">
				<ul class="list-group">
					<li class="list-group-item list-group-item-<!-- IF checks.markdown -->success<!-- ELSE -->danger<!--ENDIF checks.markdown -->">
						<strong>Markdown Compatibility</strong>
						<!-- IF checks.markdown -->
						<span class="badge"><i class="fa fa-check"></i></span>
						<p>The Markdown plugin is either disabled, or HTML sanitization is disabled</p>
						<!-- ELSE -->
						<span class="badge"><i class="fa fa-times"></i></span>
						<p>
							In order to render post content correctly, the Markdown plugin needs to have HTML sanitization disabled,
							or the entire plugin should be disabled altogether.
						</p>
						<!-- ENDIF checks.markdown -->
					</li>
					<li class="list-group-item list-group-item-<!-- IF checks.composer -->success<!-- ELSE -->danger<!--ENDIF checks.composer -->">
						<strong>Composer Conflicts</strong>
						<!-- IF checks.composer -->
						<span class="badge"><i class="fa fa-check"></i></span>
						<p>Great! Looks like BBCodes is the only composer active</p>
						<!-- ELSE -->
						<span class="badge"><i class="fa fa-times"></i></span>
						<p>BBCodes must be the only composer active. Please disable other composers and reload NodeBB.</p>
						<!-- ENDIF checks.composer -->
					</li>
				</ul>
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