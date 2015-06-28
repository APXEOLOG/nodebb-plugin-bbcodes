(function(module) {
	"use strict";

	var defaultCodes = {
		"b": {
			apply: function(value, argument) {
				return '<b>' + value + '</b>';
			}
		},
		"i": {
			apply: function(value, argument) {
				return '<i>' + value + '</i>';
			}
		},
		"u": {
			apply: function(value, argument) {
				return '<u>' + value + '</u>';
			}
		},
		"s": {
			apply: function(value, argument) {
				return '<s>' + value + '</s>';
			}
		},
		"link": {
			apply: function(value, argument) {
				return '<a href="' + value + '">' + (argument !== undefined ? argument : value) + '</a>';
			}
		},
		"img": {
			apply: function(value, argument) {
				return '<img src="' + value + '"></img>';
			}
		},
		"color": {
			apply: function(value, argument) {
				return '<font color="' + argument + '">' + value + '</font>';
			}
		},
		"code": {
			suspendParsing: true,
			apply: function(value, argument) {
				return value;
			}
		},
		"list": {
			apply: function(value, argument) {
				return '<ul>' + value + '</ul>';
			}
		},
		"*": {
			singleTag: true,
			apply: function(value, argument) {
				return '<li>' + value + '</li>';
			}
		}
	};

	var BBCodeParser = function(string, codes) {
		this.string = string;

		this.position = -1;
		this.state = STATE_CONTENT;
		this.storedPosition = 0;
		this.contentPosition = 0;

		var STATE_NONE = 0;
		var STATE_TOKEN_ADD = 1;
		var STATE_TOKEN_REMOVE = 2;
		var STATE_TOKEN_PARAMETER = 3;
		var STATE_CONTENT = 4;

		this.bbcodes = codes;
		this.tokens = [];

		var Node = function(type) {
			this.type = type;
		};

		var Code = function(token) {
			this.type = 'code';
			this.token = token;
			this.children = [];
			this.closed = false;

			this.getRawString = function() {
				return this.parameter !== undefined ?
					 '[' + this.token + '=' + this.parameter + ']' :
					 '[' + this.token + ']'
			}

			this.getString = function(codes) {
				var buffer = "";
				for (var i = 0; i < this.children.length; i++) {
					buffer += this.children[i].getString(codes);
				}
				if (this.closed === false) {
					return this.getRawString() + buffer;
				} else {
					return codes[this.token].apply(buffer, this.parameter);
				}
			}
		}
		Code.prototype = Node;

		var Content = function(value) {
			this.type = 'string';
			this.value = value;

			this.getString = function(codes) {
				return this.value;
			}
		}
		Content.prototype = Node;

		var Root = function() {
			this.type = 'root';
			this.children = [];

			this.getString = function(codes) {
				var buffer = "";
				for (var i = 0; i < this.children.length; i++) {
					buffer += this.children[i].getString(codes);
				}
				return buffer;
			}
		}
		Root.prototype = Node;

		this.cur = function() {
			return this.position < this.string.length ? this.string[this.position] : false;
		}

		this.next = function() {
			return this.position + 1 < this.string.length ? this.string[this.position + 1] : false;
		}

		this.token = function() {
			return this.string.substring(this.storedPosition, this.position);
		}

		this.content = function() {
			return this.string.substring(this.contentPosition, this.position);
		}

		this.pushContent = function() {
			var content = this.content();
			if (content.length > 0) {
				if (this.peekTop()) {
					this.peekTop().children.push(new Content(content));
				}
			}
		}

		this.peekTop = function() {
			return this.tokens.length > 0 ? this.tokens[0] : false;
		}

		this.popUntilMatched = function(token) {
			for (var i = 0; i < this.tokens.length; i++) {
				if (this.tokens[i].token === token) break;
			}
			if (i < this.tokens.length) {
				while (this.tokens[0].token !== token) {
					var node = this.tokens.shift();
					if (this.bbcodes[node.token] !== undefined && this.bbcodes[node.token].singleTag === true)
						node.closed = true;
				}
				this.popTop();
				return true;
			}
			// Nothing matched, tag should be misspelled
			return false;
		}

		this.pushTop = function(element) {
			if (this.tokens.length > 0) {
				this.tokens[0].children.push(element);
			}
			this.tokens.unshift(element);
		}

		this.popTop = function() {
			this.tokens[0].closed = true;
			this.tokens.shift();
		}

		this.end = function() {
			return this.position >= this.string.length;
		}

		this.isParsingSuspended = function() {
			return (this.bbcodes[this.tokens[0].token] !== undefined && this.bbcodes[this.tokens[0].token].suspendParsing !== undefined) ?
				this.bbcodes[this.tokens[0].token].suspendParsing : false;
		}

		this.isSingleTag = function() {
			return (this.bbcodes[this.tokens[0].token] !== undefined && this.bbcodes[this.tokens[0].token].singleTag !== undefined) ?
				this.bbcodes[this.tokens[0].token].singleTag : false;
		}

		this.parse = function() {
			this.position = -1;
			this.storedPosition = 0;
			this.contentPosition = 0;
			this.state = STATE_CONTENT;
			this.pushTop(new Root());
			while (this.position < this.string.length) {
				this.position++;
				if (this.end()) {
					this.pushContent();
					continue;
				}
				if (this.state === STATE_CONTENT) {
					if (this.cur() === '[') {
						this.pushContent();
						this.contentPosition = this.position;
						if (this.next() === '/') {
							this.state = STATE_TOKEN_REMOVE;
							this.position++;
						} else {
							if (!this.isParsingSuspended())
								this.state = STATE_TOKEN_ADD;
						}
						this.storedPosition = this.position + 1;
						continue;
					} else {
						continue;
					}
				} else if (this.state === STATE_TOKEN_ADD) {
					if (this.cur() === '=') {
						var token = this.token();
						if (this.bbcodes[token] !== undefined) {
							if (this.isSingleTag() && this.tokens[0].token === token) {
								this.popTop();
							}
							this.pushTop(new Code(token));
							this.storedPosition = this.position + 1;
							this.state = STATE_TOKEN_PARAMETER;
							continue;
						} else {
							this.state = STATE_CONTENT;
							continue;
						}
					} else if (this.cur() === ']') {
						var token = this.token();
						if (this.bbcodes[token] !== undefined) {
							if (this.isSingleTag() && this.tokens[0].token === token) {
								this.popTop();
							}
							this.pushTop(new Code(token));
							this.contentPosition = this.position + 1;
							this.state = STATE_CONTENT;
							continue;
						} else {
							this.state = STATE_CONTENT;
							continue;
						}
					} else {
						continue;
					}
				} else if (this.state === STATE_TOKEN_PARAMETER) {
					if (this.cur() === ']') {
						var token = this.token();
						this.peekTop().parameter = token;
						this.contentPosition = this.position + 1;
						this.state = STATE_CONTENT;
						continue;
					} else {
						continue;
					}
				} else if (this.state === STATE_TOKEN_REMOVE) {
					if (this.cur() === ']') {
						var token = this.token();
						if (this.isParsingSuspended()) {
							if (this.tokens[0].token === token) {
								this.popTop();
								this.contentPosition = this.position + 1;
								this.state = STATE_CONTENT;
								continue;
							} else {
								this.state = STATE_CONTENT;
								continue;
							}
						} else {
							if (this.popUntilMatched(token) === true) {
								this.contentPosition = this.position + 1;
								this.state = STATE_CONTENT;
								continue;
							} else {
								this.state = STATE_CONTENT;
								continue;
							}
						}
					} else {
						continue;
					}
				}
			}
			var result = this.tokens[this.tokens.length - 1].getString(this.bbcodes);
			return result;
		}
	}

	var winston = require('winston');

	module.exports.load = function(object, callback) {
		var plugins = module.parent.require('./plugins');
		plugins.fireHook('static:plugin-bbcodes-load', { codeTable: defaultCodes });
		winston.verbose("BBCode plugin loaded");
		callback(object);
	};

	module.exports.parse = function(data, callback) {
		if (!data || !data.postData || !data.postData.content) {
			return callback(null, data);
		}
		var sanitized = data.postData.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		data.postData.content = new BBCodeParser(sanitized, defaultCodes).parse();

		callback(null, data);
	};
}(module));