jQuery.fn.getEvents = function() {
    if (typeof(jQuery._data) == 'function') {
        return jQuery._data(this.get(0), 'events') || {};
    } else if (typeof(this.data) == 'function') { // jQuery version < 1.7.?
        return this.data('events') || {};
    }
    return {};
};

jQuery.fn.preBind = function(type, data, fn) {
    this.each(function () {
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
				var topicUUID = composer.findByTid(data.tid);
				composer.addQuote(data.tid, data.slug, data.index, data.pid, data.topicName, data.username, data.text, topicUUID);
			});
		});
	});

	$(window).on('action:composer.loaded', function(ev, data) {
		/* Setup WysiBB here */
		var postContainer = $('#cmp-uuid-' + data.post_uuid),
			textarea = postContainer.find('#wysibb-editor');
			WysiBB = textarea.wysibb();
		// Prebind 'Submit' method to sync textarea with html content 
		postContainer.find('.composer-submit').preBind('click', function() {
			WysiBB.sync();
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