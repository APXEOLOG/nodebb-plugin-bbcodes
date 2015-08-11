# nodebb-plugin-bbcodes
BBCode plugin for NodeBB

Major update to version 2.0:
* Reworked parser architecture to callback mechanism
* Extended hook table, so bbcodes can now process 4 requests (get, create, edit, render) so they can define more complex behavior
* Extended parser to support custom multiargument format ([tag:name=value;name2=value2]...[/tag])
* Integrated WysiBB composer (http://www.wysibb.com/)
* Added many new bbcodes to match WysiBB existing codes
* [spoiler] integrated into the core
* **Old bbcode plugins are not supported**
* Added [aspoiler] tag - Ajax Spoiler, first one wich use new exntended processing mechanism

Composer preview:
![WysiBB Composer](http://i.imgur.com/cM9v19x.png)

Ajax spoiler tag:
Spoiler content is loaded only when button is clicked. Note, that after you save the post first time, each aspoiler tag will have it's own id. Don't remove or change it manually or you will loose it's content.

Syntax example:

`[aspoiler]Something![/aspoiler]` - default

`[aspoiler:name=Spoiler Name!]Content[/aspoiler]` - named spoiler

`[aspoiler:name=Spoiler Name!;id=1234]Content[/aspoiler]` - this is what you will see, when you'll try to edit it. 

Perview GIF: http://i.imgur.com/IioJxsk.gifv



Old releases:
Version 1.2.0 Changelog:
* Now can be used with markdown plugin
If you want to use it with markdown, disable HTML Sanitization in plugin settings (admin panel)
See http://forum.apxeolog.com/topic/8/nodebb-bbcode-plugin for more information
