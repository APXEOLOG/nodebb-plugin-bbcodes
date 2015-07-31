$('document').ready(function() {
	require(['composer', 'composer/controls'], function(composer, controls) {
		if (composer === undefined || composer.addButton === undefined) return;
		
		composer.addButton('fa fa-bold', function(textarea, selectionStart, selectionEnd) {
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, "[b] Bolded Text [/b]");
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 16);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '[b]', '[/b]');
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
			}
		});
		
		composer.addButton('fa fa-italic', function(textarea, selectionStart, selectionEnd) {
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, "[i] Italic Text [/i]");
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 16);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '[i]', '[/i]');
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
			}
		});
		
		composer.addButton('fa fa-underline', function(textarea, selectionStart, selectionEnd) {
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, "[u] Underline Text [/u]");
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 19);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '[u]', '[/u]');
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
			}
		});
		
		composer.addButton('fa fa-strikethrough', function(textarea, selectionStart, selectionEnd) {
			if(selectionStart === selectionEnd){
				controls.insertIntoTextarea(textarea, "[s] Strikethrough [/s]");
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionStart + 18);
			} else {
				controls.wrapSelectionInTextareaWith(textarea, '[s]', '[/s]');
				controls.updateTextareaSelection(textarea, selectionStart + 3, selectionEnd + 3);
			}
		});
		
		composer.addButton('fa fa-link', function(textarea, selectionStart, selectionEnd) {
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