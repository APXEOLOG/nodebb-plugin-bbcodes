jQuery.fn.getEvents = function() {
	if (typeof(jQuery._data) == 'function') {
		return jQuery._data(this.get(0), 'events') || {};
	} else if (typeof(this.data) == 'function') { // jQuery version < 1.7.?
		return this.data('events') || {};
	}
	return {};
};

jQuery.fn.preBind = function(type, data, fn) {
	this.each(function() {
		var $this = jQuery(this);

		$this.bind(type, data, fn);

		var currentBindings = $this.getEvents()[type];
		if (jQuery.isArray(currentBindings)) {
			currentBindings.unshift(currentBindings.pop());
		}
	});
	return this;
};

$(document).ready(function() {
	$(window).on('action:app.load', function() {
		require(['composer'], function(composer) {
			$(window).on('action:composer.topic.new', function(ev, data) {
				composer.newTopic(data.cid);
			});

			$(window).on('action:composer.post.edit', function(ev, data) {
				composer.editPost(data.pid);
			});

			$(window).on('action:composer.post.new', function(ev, data) {
				console.log("Reply");
				console.log(data);
				composer.newReply(data.tid, data.pid, data.topicName, data.text);
			});

			$(window).on('action:composer.addQuote', function(ev, data) {
				var rawText = data.text.replace(/\n> /g, '\n').substring(2);
				var bbCodedText = '[quote=' + data.username.substring(1) + ']' + rawText.substring(0, rawText.length - 2) + '[/quote]';
				var topicUUID = composer.findByTid(data.tid);
				composer.addQuote(data.tid, data.slug, data.index, data.pid, data.topicName, data.username, bbCodedText, topicUUID);
			});
		});
	});

	$(window).on('action:composer.loaded', function(ev, data) {
		/* Setup WysiBB here */
		var postContainer = $('#cmp-uuid-' + data.post_uuid),
			textarea = postContainer.find('#wysibb-editor');

		window.WysiBB = textarea.wysibb({
			buttons: "bold,italic,underline,strike,|,img,video,link,|,bullist,numlist,|,fontcolor,fontsize,fontfamily,|,justifyleft,justifycenter,justifyright,|,quote,code,table",
			allButtons: {
				quote: {
					title: 'Quote',
					buttonText: 'quote',
					transform: {
						'<blockquote>{SELTEXT}</blockquote>':"[quote]{SELTEXT}[/quote]",
						'<p>{AUTHOR} said:</p><blockquote>{SELTEXT}</blockquote>':'[quote={AUTHOR}]{SELTEXT}[/quote]'
					}
				},
				spoiler: {
					title: 'Spoiler',
					buttonText: 'spoiler',
					transform: {
						'<div class="panel panel-default"><div class="panel-heading"><button type="button" onclick="$(this).parent().next().collapse(\'toggle\');" class="btn btn-default btn-xs btn-ajx-spoiler" data-toggle="collapse">Spoiler</button></div><div class="panel-collapse collapse out"><div class="panel-body">{SELTEXT}</div></div></div>':"[spoiler]{SELTEXT}[/spoiler]",
						'<div class="panel panel-default"><div class="panel-heading"><button type="button" onclick="$(this).parent().next().collapse(\'toggle\');" class="btn btn-default btn-xs btn-ajx-spoiler" data-toggle="collapse">{NAME}</button></div><div class="panel-collapse collapse out"><div class="panel-body">{SELTEXT}</div></div></div>':"[spoiler={NAME}]{SELTEXT}[/spoiler]"
					}
				}
			}
		});
		// Prebind 'Submit' method to sync textarea with html content 
		postContainer.find('.composer-submit').preBind('click', function() {
			window.WysiBB.sync();
		});
	});

	$(window).on('action:composer.resize', function(ev, data) {
		require(['composer'], function(composer) {
			// Additional values, since composer.tpl was changed
			$('.wysibb-text-editor').css('min-height', data.containerHeight + 60);
			$('.wysibb-text-editor').css('max-height', data.containerHeight + 60);
		});
	});
});