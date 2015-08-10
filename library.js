(function(module) {
	"use strict";

	// Abstract BBCode Parser
	var BBCodeParser = function(postData, codes, method, callback) {
		this.postData = postData;
		this.string = postData.content;

		this.position = -1;
		this.state = STATE_CONTENT;
		this.storedPosition = 0;
		this.contentPosition = 0;

		var STATE_NONE = 0;
		var STATE_TOKEN_ADD = 1;
		var STATE_TOKEN_REMOVE = 2;
		var STATE_TOKEN_PARAMETER = 3;
		var STATE_TOKEN_PARAMETER_MULTIPLE = 4;
		var STATE_CONTENT = 5;

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

			this.applyParameters = function(paramString) {
				this.parameters = {};
				var pairs = paramString.split(';');
				for (var i = 0; i < pairs.length; i++) {
					var tokens = pairs[i].split('=');
					this.parameters[tokens[0]] = tokens[1];
				}
			}

			this.applyParameter = function(paramString) {
				this.parameter = paramString;
			}

			this.getRawString = function() {
				if (this.parameter !== undefined) {
					return '[' + this.token + '=' + this.parameter + ']';
				} else if (this.parameters !== undefined) {
					var keys = Object.keys(this.parameters);
					var string = '[' + this.token + ':';
					for (var i = 0; i < keys.length; i++) {
						string += keys[i] + '=' + this.parameters[keys[i]];
						if (i != keys.length - 1) string += ';';
					}
					return string + ']';
				} else {
					return '[' + this.token + ']';
				}
			}

			this.getOwnStringRepresentation = function(value) {
				return this.getRawString() + (value !== undefined ? value : '') + '[/' + this.token + ']';
			}

			this.getString = function(codes, parent, data, callback) {
				var _this = this;
				var content = "";
				function processContent() {
					if (_this.closed === false) {
						callback(_this.getRawString() + content);
					} else {
						var bbCodeBuf = codes[_this.token];
						if (bbCodeBuf[method] !== undefined) {
							codes[_this.token][method]({
								node: _this,
								parent: parent,
								value: content,
								argument: _this.parameter !== undefined ? _this.parameter : _this.parameters,
								data: data
							}, function(result) {
								callback(result);
							});
						} else {
							callback(_this.getOwnStringRepresentation(content));
						}
					}
				}
				function iterateOverChildren(index) {
					_this.children[index].getString(codes, _this, data, function(buffer) {
						content += buffer;
						if (index + 1 < _this.children.length) {
							iterateOverChildren(index + 1);
						} else {
							processContent();
						}
					});
				}
				if (this.children.length > 0)
					iterateOverChildren(0);
				else 
					processContent();
			}
		}
		Code.prototype = Node;

		var Content = function(value) {
			this.type = 'string';
			this.value = value;

			this.getString = function(codes, parent, data, callback) {
				callback(this.value);
			}
		}
		Content.prototype = Node;

		var Root = function() {
			this.type = 'root';
			this.children = [];

			this.getString = function(codes, data, callback) {
				var _this = this;
				var content = "";
				function iterateOverChildren(index) {
					_this.children[index].getString(codes, _this, data, function(buffer) {
						content += buffer;
						if (index + 1 < _this.children.length) {
							iterateOverChildren(index + 1);
						} else {
							callback(content);
						}
					});
				}
				iterateOverChildren(0);
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
					} else if (this.cur() === ':') {
						var token = this.token();
						if (this.bbcodes[token] !== undefined) {
							if (this.isSingleTag() && this.tokens[0].token === token) {
								this.popTop();
							}
							this.pushTop(new Code(token));
							this.storedPosition = this.position + 1;
							this.state = STATE_TOKEN_PARAMETER_MULTIPLE;
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
						this.peekTop().applyParameter(token);
						this.contentPosition = this.position + 1;
						this.state = STATE_CONTENT;
						continue;
					} else {
						continue;
					}
				} else if (this.state === STATE_TOKEN_PARAMETER_MULTIPLE) {
					if (this.cur() === ']') {
						var token = this.token();
						this.peekTop().applyParameters(token);
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
			this.tokens[this.tokens.length - 1].getString(this.bbcodes, { postData: this.postData }, callback);
		}
	}

	var bbCodesTable = {
		"b": {
			apply: function(info, callback) {
				callback('<b>' + info.value + '</b>');
			}
		},
		"i": {
			apply: function(info, callback) {
				callback('<i>' + info.value + '</i>');
			}
		},
		"u": {
			apply: function(info, callback) {
				callback('<u>' + info.value + '</u>');
			}
		},
		"s": {
			apply: function(info, callback) {
				callback('<s>' + info.value + '</s>');
			}
		},
		"table": {
			apply: function(info, callback) {
				callback('<table>' + info.value + '</table>');
			}
		},
		"tr": {
			apply: function(info, callback) {
				callback('<tr>' + info.value + '</tr>');
			}
		},
		"td": {
			apply: function(info, callback) {
				callback('<td>' + info.value + '</td>');
			}
		},
		"size": {
			apply: function(info, callback) {
				callback('<font size="' + info.argument + '">' + info.value + '</s>');
			}
		},
		"font": {
			apply: function(info, callback) {
				callback('<span style="font-family:' + info.argument + '">' + info.value + '</span>');
			}
		},
		"center": {
			apply: function(info, callback) {
				callback('<p style="text-align:center">' + info.value + '</p>');
			}
		},
		"left": {
			apply: function(info, callback) {
				callback('<p style="text-align:left">' + info.value + '</p>');
			}
		},
		"right": {
			apply: function(info, callback) {
				callback('<p style="text-align:right">' + info.value + '</p>');
			}
		},
		"link": {
			apply: function(info, callback) {
				callback('<a href="' + info.value + '">' + (typeof argument === 'string' ? argument : info.value) + '</a>');
			}
		},
		"img": {
			apply: function(info, callback) {
				callback('<img style="max-width: 100%;" src="' + info.value + '"></img>');
			}
		},
		"color": {
			apply: function(info, callback) {
				callback('<font color="' + info.argument + '">' + info.value + '</font>');
			}
		},
		"code": {
			suspendParsing: true,
			apply: function(info, callback) {
				callback('<code>' + info.value + '</code>');
			}
		},
		"list": {
			apply: function(info, callback) {
				if (info.argument === "1") {
					callback('<ol>' + info.value + '</ol>');
				} else
					callback('<ul>' + info.value + '</ul>');
			}
		},
		"video": {
			apply: function(info, callback) {
				callback('<div><iframe frameborder="0" id="ytplayer" type="text/html" width="640" height="390" src="http://www.youtube.com/embed/' + info.value + '"></iframe></div>');
			}
		},
		"*": {
			apply: function(info, callback) {
				if (info.parent.token === "list") {
					callback('<li>' + info.value + '</li>');
				}
				if (info.parent.token === "poll") {
					var jadeFn = jade.compileFile('node_modules/nodebb-plugin-bbcodes/templates/jade/poll-element.tpl', {});
					callback(jadeFn({ value: info.value, argument : info.argument }));
				}
			}
		},
		"quote": {
			apply: function(info, callback) {
				callback((info.argument !== undefined ? "<p>" + info.argument + " said: </p>" : "") + "<blockquote>" + info.value + "</blockquote>");
			}
		},
		"spoiler": {
			apply: function(info, callback) {
				var jadeFn = jade.compileFile('node_modules/nodebb-plugin-bbcodes/templates/jade/spoiler.tpl', {});
				callback(jadeFn({ value: info.value, argument : (info.argument != undefined ? info.argument : "Spoiler") }));
			}
		},
		"poll": {
			apply: function(info, callback) {
				callback("");
				/*data.pollMainIndex = data.pollMainIndex === undefined ? 0 : data.pollMainIndex + 1; // Update current poll index
				data.pollOptionIndex = 0; // Reset option counter to 0

				data.postData.pid
				var jadeFn = jade.compileFile('node_modules/nodebb-plugin-bbcodes/templates/jade/poll-main.tpl', {});
				callback(jadeFn({ value: value, argument : argument !== undefined ? argument : 'Poll', id: 'poll_id' });*/
			}
		},
		"aspoiler": {
			apply: function(info, callback) {
				var jadeFn = jade.compileFile('node_modules/nodebb-plugin-bbcodes/templates/jade/ajax-spoiler.tpl', {});
				callback(jadeFn({ value: info.value, argument : (info.argument.name != undefined ? info.argument.name : "Spoiler"), id: info.argument.id }));
			},
			save: function(info, callback) {
				if (typeof info.argument === 'object' && info.argument.id !== undefined) {
					// We already have generated ID
					// Check if this id related to this post
					db.isSetMember('bbdynamic-pid:' + info.data.postData.pid, info.argument.id, function(err, result) {
						if (result === true) {
							// Seems legit. Update content
							db.setObjectField('bb-ajax-spoiler:content', info.argument.id, info.value);
							callback(info.node.getOwnStringRepresentation());
						} else {
							// Looks like shit, don't link existing aspoiler with new post
							callback(info.value);
						}
					});					
				} else {
					// Generate new spoiler ID
					generateNextDynamicID(info.data.postData.pid, function(spoilerId) {
						// Store spoiler content in the specific table
						db.setObjectField('bb-ajax-spoiler:content', spoilerId, info.value);
						// Add id to code
						if (info.node.parameters === undefined) info.node.parameters = {}; 
						info.node.parameters.id = spoilerId;
						// Return raw input without content
						callback(info.node.getOwnStringRepresentation());
					});
				}
			},
			edit: function(info, callback) {
				if (typeof info.argument === 'object' && info.argument.id !== undefined) {
					// We already have generated ID
					// Check if this id related to this post
					db.isSetMember('bbdynamic-pid:' + info.data.postData.pid, info.argument.id, function(err, result) {
						if (result == true) {
							// Seems legit. Update content
							db.setObjectField('bb-ajax-spoiler:content', info.argument.id, info.value);
						}
					});
					info.data.postData.dinIds.push(info.argument.id);
					// Return raw input without content
					callback(info.node.getOwnStringRepresentation());
				} else {
					// Generate new spoiler ID
					generateNextDynamicID(info.data.postData.pid, function(spoilerId) {
						// Store spoiler content in the specific table
						db.setObjectField('bb-ajax-spoiler:content', spoilerId, info.value);
						// Add id to code
						if (info.node.parameters === undefined) info.node.parameters = {}; 
						info.node.parameters.id = spoilerId;
						info.data.postData.dinIds.push(spoilerId);
						// Return raw input without content
						callback(info.node.getOwnStringRepresentation());
					});
				}
			},
			get: function(info, callback) {
				if (typeof info.argument === 'object' && info.argument.id !== undefined) {
					// Check if this id related to this post
					db.isSetMember('bbdynamic-pid:' + info.data.postData.pid, info.argument.id, function(err, result) {
						if (result == true) {
							// Seems legit. Return content
							db.getObjectField('bb-ajax-spoiler:content', info.argument.id, function(err, result) {
								if (err !== null) {
									return callback(info.node.getOwnStringRepresentation());
								} else {
									return callback(info.node.getOwnStringRepresentation(result));
								}
							});
						} else {
							return callback(info.node.getOwnStringRepresentation());
						}
					});
				} else {
					return callback(info.node.getOwnStringRepresentation());
				}
			},
		}
	};

	var winston = require('winston'),
		meta = module.parent.require('./meta'),
		plugins = module.parent.require('./plugins'),
		jade = require('jade'),
		db = module.parent.require('./database'),
		async = require('async'),
		privileges = module.parent.require('./privileges'),

		sanitize = true,
		globalDynamicID = 0;

	/* ============================================ */
	/* 			WysiBB Composer Integration			*/
	/* ============================================ */
	function composerInit() {
		if (true) { // TODO: Check
			require('nodebb-plugin-composer-default').init({}, function(){});
		} else {
			winston.warn('[bbcodes] Another composer plugin is active! Please disable all other composers.');
		}
	}

	function checkCompatibility(callback) {
		async.parallel({
			active: async.apply(plugins.getActive),
			markdown: async.apply(meta.settings.get, 'markdown')
		}, function(err, data) {
			callback(null, {
				markdown: data.active.indexOf('nodebb-plugin-markdown') === -1 || data.markdown.html === 'on',
				//			^ plugin disabled										^ HTML sanitization disabled
				composer: data.active.filter(function(plugin) {
					return plugin.startsWith('nodebb-plugin-composer-') && plugin !== 'nodebb-plugin-composer-redactor';
				}).length === 0
			})
		});
	};

	/* ============================================ */
	/* ============================================ */
	/* ============================================ */


	// Ajax spoiler
	function ajaxSpoilerController(req, res, next) {
		if (req.body['id'] === undefined || req.body['pid'] === undefined) {
			return res.json({ success: false });
		}
		privileges.posts.can('read', req.body['pid'], req.user !== undefined ? req.user.uid : 0, function(err) {
			if (err !== null) return res.json({ success: false });

			db.isSetMember('bbdynamic-pid:' + req.body['pid'], req.body['id'], function(err, result) {
				if (result == true) {
					// Seems legit. Get content
					db.getObjectField('bb-ajax-spoiler:content', req.body['id'], function(err, data) {
						if (err !== null) {
							return res.json({ success: false });
						}
						new BBCodeParser({ content: data, pid: req.body['pid'] }, bbCodesTable, 'apply', function(result) {
							return res.json({ success: true, content: result });
						}).parse();
					});
				} else {
					return res.json({ success: false });
				}
			});
		});	
	}

	function generateNextDynamicID(pid, callback) {
		var newDynID = globalDynamicID++;
		async.waterfall([
				function(next) {
					db.set('bbcodes-dynamic-id', globalDynamicID, next);
				},
				function(next) {
					db.setAdd('bbdynamic-pid:' + pid, newDynID, next);
				}
			], function(err, result) {
				if (callback !== undefined) {
					callback(newDynID);
				}
			}
		);
		return newDynID;
	}

	// plugins.fireHook('filter:post.save', postData, next);
	module.exports.onPostSave = function(postData, next) {
		// Parse dynamic tags and store ID's in the tag
		new BBCodeParser(postData, bbCodesTable, 'save', function(result) {
			postData.content = result;
			next(null, postData);
		}).parse();
	};

	// plugins.fireHook('filter:post.edit', {post: postData, uid: data.uid}, next);
	module.exports.onPostEdit = function(data, next) {
		// Check if stored ID's changes and perform cleanup if needed
		var extendedObj = { content: data.post.content, pid: data.post.pid, dinIds: new Array() };
		new BBCodeParser(extendedObj, bbCodesTable, 'edit', function(result) {
			// Cleanup
			db.getSetMembers('bbdynamic-pid:' + data.post.pid, function(err, values) {
				if (err === null) {
					for (var i in values) {
						if (extendedObj.dinIds.indexOf(values[i]) < 0) {
							// Should remove this content
							winston.info("Content should be removed: " + values[i]);
							db.setRemove('bbdynamic-pid:' + data.post.pid, values[i]);
						}
					}
				}
			});
			data.post.content = result;
			next(null, data);
		}).parse();
	};

	// plugins.fireHook('filter:post.getFields', {posts: [data], fields: fields}, next)
	module.exports.onPostGetFields = function(data, next) {
		// Check if stored ID's changes and perform cleanup if needed
		// Let's try to detect composer's request. 
		// This is fcking hook but we will watch for fields=[content, tid, uid, handle]
		// Assuming that this request is from composer
		if (data.fields.indexOf("content") >= 0
			&& data.fields.indexOf("tid") >= 0
			&& data.fields.indexOf("tid") >= 0
			&& data.fields.indexOf("handle") >= 0) {
			new BBCodeParser(data.posts[0], bbCodesTable, 'get', function(result) {
				data.posts[0].content = result;
				next(null, data);
			}).parse();
		} else {
			next(null, data);
		}
	};

	// plugins.fireHook('action:post.purge', pid);
	module.exports.onPostPurge = function(pid) {
		// Cleanup all related dynamic data
		db.delete('bbdynamic-pid:' + pid);
	};

	module.exports.parse = function(data, callback) {
		if (!data || !data.postData || !data.postData.content) {
			return callback(null, data);
		}
		if (sanitize) {
			data.postData.content= data.postData.content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />");
		}
		new BBCodeParser(data.postData, bbCodesTable, 'apply', function(result) {
			data.postData.content = result;
			callback(null, data);
		}).parse();
		
	};

	function adminPanelController(req, res, next) {
		res.render('bbcodes-admin', { });
	};
	
	module.exports.load = function(app, next) {
		// Load globalDynamicID
		db.get('bbcodes-dynamic-id', function(err, value) {
			if (err != null || parseInt(value, 10).toString() === 'NaN') {
				// First run or errors
				db.set('bbcodes-dynamic-id', 0);
				globalDynamicID = 0;
				winston.info('Resetting globalDynamicID: ' + globalDynamicID);
			} else {
				globalDynamicID = parseInt(value, 10);
				winston.info('Loaded globalDynamicID: ' + globalDynamicID);
			}
		});
		// Fire hook to collect extensions
		plugins.fireHook('static:plugin-bbcodes-load', { codeTable: bbCodesTable });
		// Bind admin panel url
		app.router.get('/admin/plugins/bbcodes', app.middleware.admin.buildHeader, adminPanelController);
		app.router.get('/api/admin/plugins/bbcodes', adminPanelController);

		// Ajax Spoiler
		app.router.post('/api/bbcodes/getSpoilerContent', ajaxSpoilerController);

		composerInit();

		meta.configs.getFields(['bbcodes-sanitize'], function(err, config) {
			if (config && config["bbcodes-sanitize"]) {
				if (config["bbcodes-sanitize"] === '0') {
					sanitize = false;
				}
			} else {
				meta.configs.set('bbcodes-sanitize', '1');
			}
			winston.verbose("BBCode plugin loaded");
			next(null);
		});
	};

	module.exports.extendAdminMenu = function(header, next) {
		header.plugins.push({
			"route": '/plugins/bbcodes',
			"icon": 'fa-bold',
			"name": 'BBCodes'
		});
		next(null, header);
	};
}(module));