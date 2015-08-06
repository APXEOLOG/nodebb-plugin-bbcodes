$('document').ready(function() {
	require(['composer', 'composer/controls'], function(composer, controls) {
		if (composer === undefined || composer.addButton === undefined) return;
		
		composer.addButton('bbcode fa fa-bold', function(textarea, selectionStart, selectionEnd) {
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, "[b] Bolded Text [/b]");
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 16);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '[b]', '[/b]');
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
			}
		});
		
		composer.addButton('bbcode fa fa-italic', function(textarea, selectionStart, selectionEnd) {
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, "[i] Italic Text [/i]");
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 16);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '[i]', '[/i]');
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
			}
		});
		
		composer.addButton('bbcode fa fa-underline', function(textarea, selectionStart, selectionEnd) {
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, "[u] Underline Text [/u]");
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 19);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '[u]', '[/u]');
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
			}
		});
		
		composer.addButton('bbcode fa fa-strikethrough', function(textarea, selectionStart, selectionEnd) {
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, "[s] Strikethrough [/s]");
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 18);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '[s]', '[/s]');
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
			}
		});
		
		composer.addButton('bbcode fa fa-link', function(textarea, selectionStart, selectionEnd) {
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, "[link] Link [/link]");
				controls.updateTextareaSelection(textarea, selectionStart + 6, selectionStart + 12);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '[link]', '[/link]');
				controls.updateTextareaSelection(textarea, selectionStart + 6, selectionEnd + 6);
			}
		});
		
	});
});

$('document').ready(function() {
	$('body').on('click', '.btn-ajx-spoiler', function() {
		var spoilerButton = $(this);
		var spoilerHeader = spoilerButton.parent().parent();
		if (spoilerButton.attr('sync') === 'true') {
			spoilerHeader.find(".panel-collapse").toggle();
		} else {
			var spoilerId = spoilerHeader.attr('ajax-spoiler-id');
			var pid = spoilerHeader.parents("li[component=post]").attr('data-pid');
			if (spoilerId !== undefined) {
				spoilerHeader.find('.ajax-spoiler-spin').removeClass('hidden');
				spoilerHeader.find('.ajax-spoiler-error').addClass('hidden');
				$.post('/api/bbcodes/getSpoilerContent', { id: spoilerId, pid: pid }, function(data) {
					spoilerHeader.find('.ajax-spoiler-spin').addClass('hidden');
					if (data.success === true) {
						spoilerHeader.find(".panel-body").html(data.content);
						spoilerHeader.find(".panel-collapse").toggle();
						spoilerButton.attr('sync', 'true');
					} else {
						spoilerHeader.find('.ajax-spoiler-error').removeClass('hidden');
					}
				}, "json");
			}
		}
	});
});