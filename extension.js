const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const GLib = imports.gi.GLib;
const PopupMenu = imports.ui.popupMenu;
const PanelMenu = imports.ui.panelMenu;
const Lang = imports.lang;
const Gtk = imports.gi.Gtk;
const Soup = imports.gi.Soup;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

/*********************************************************************************************************************************************/
let controller = undefined;
let _httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

let errorTextPopup;
function hideError() {
	Main.uiGroup.remove_actor(errorTextPopup);
	errorTextPopup = null;
}

function showError(errorText) {
	if (!errorTextPopup) {
		errorTextPopup = new St.Label({ style_class: 'openerp-error', text: "OpenERP ERROR: "+errorText });
		Main.uiGroup.add_actor(errorTextPopup);
	}

	errorTextPopup.opacity = 255;

	let monitor = Main.layoutManager.primaryMonitor;

	errorTextPopup.set_position(Math.floor(monitor.width / 2 - errorTextPopup.width / 2),
		Math.floor(monitor.height / 2 - errorTextPopup.height / 2));

	Tweener.addTween(errorTextPopup,
		{ opacity: 0,
			time: 10,
			transition: 'easeOutQuad',
			onComplete: hideError });
}

/*********************************************************************************************************************************************/

const CategoryMenuItem = new Lang.Class({
	Name: 'CategoryMenuItem',
	Extends: PopupMenu.PopupBaseMenuItem,

	_init: function() {
		this.parent();
		this.addActor(new St.Label({ text: "PROJECT" }));
	},

	activate: function(event) {
		this.parent(event);
	},

	setActive: function(active, params) {
		this.parent(active, params);
	}
});

/*****************************************************************************************************************************************/

function OpenErpExtension(extensionMeta) {
	this._init(extensionMeta);
}

OpenErpExtension.prototype = {
	__proto__: PanelMenu.Button.prototype,



	_init: function(extensionMeta) {
		PanelMenu.Button.prototype._init.call(this, 0.0);

		this.userId = -1;

		this.extensionMeta = extensionMeta;
		
		this.settings = Convenience.getSettings();

		global.log(this.settings.get_string("host"));

		this.panelContainer = new St.BoxLayout();
		this.actor.add_actor(this.panelContainer);

		this.panelLabel = new St.Label({text: _("OpenERP")});
		this.panelLabel.show();
		
		this.panelContainer.add(this.panelLabel);

		
		let item = new PopupMenu.PopupMenuItem(_("Stop Tracking"));
		item.connect('activate', Lang.bind(this, this._onStopTracking));
		this.menu.addMenuItem(item);

		this.mainBox = new St.BoxLayout({ vertical: false });
		
		let section = new PopupMenu.PopupMenuSection();
		this.menu.addMenuItem(section);

		section.actor.add_actor(this.mainBox);

		this.leftBox = new St.BoxLayout({ vertical: true });

		
		this.projectsScrollBox = new St.ScrollView({ x_fill: true, y_fill: false,
			y_align: St.Align.START,
			style_class: 'vfade' });
		this.projectsScrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);

		this.leftBox.add(this.projectsScrollBox, { expand: true,
			x_fill: true, y_fill: true,
			y_align: St.Align.START });

		this.projectsBox = new St.BoxLayout({ vertical: true });
		this.projectsScrollBox.add_actor(this.projectsBox, { expand: true, x_fill: false });
		
		this.mainBox.add(this.leftBox);

		for(var i=0;i<100;i++){
			//let categoryMenuItem = new CategoryMenuItem();
			//this.projectsBox.add_actor(categoryMenuItem.actor);
		}

		this.rightBox = new St.BoxLayout({ vertical: true });
		this.mainBox.add(this.rightBox);


		//this.mainBox.add(this.projectsScrollBox, { expand: true, x_fill: true, y_fill: true });

		/*xmlrpc
		this.leftBox = new St.BoxLayout({ vertical: true });

		this.categoriesScrollBox = new St.ScrollView({ x_fill: true, y_fill: false,
		 y_align: St.Align.START,
		 style_class: 'vfade' });
		this.categoriesScrollBox.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC);

		this.leftBox.add(this.categoriesScrollBox, { expand: true,
		 x_fill: true, y_fill: true,
		 y_align: St.Align.START });
		
		this.categoriesBox = new St.BoxLayout({ vertical: true });
		this.categoriesScrollBox.add_actor(this.categoriesBox, { expand: true, x_fill: false });

		this.menu.addMenuItem(this.leftBox);
		*/


		this.mainBox.style=('width: 500px;');
		this.mainBox.style+=('height: 500px;');

		
		/*
		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
		item = new PopupMenu.PopupMenuItem(_("Tracking Settings"));
		item.connect('activate', Lang.bind(this, this._onShowSettingsActivate));
		this.menu.addMenuItem(item);
		*/
		//this.timeout = GLib.timeout_add_seconds(0, 60, Lang.bind(this, this.refresh));
	},

	_display: function() {
	},

	_onStopTracking: function(){
		global.log("STOP THE TRACKER");
	},

	refresh: function(proxy, sender) {
		return true;
	},

	login: function(callback){
		let request = Soup.Message.new('POST', this.settings.get_string("host")+"/xmlrpc/common");

		let rpcCall = Soup.xmlrpc_build_method_call("login", [this.settings.get_string("database"), this.settings.get_string("user"), this.settings.get_string("pass")], 3);
		request.set_request("text/xml", Soup.MemoryUse.COPY, rpcCall, rpcCall.length);

		_httpSession.queue_message(request, function(_httpSession, message) {
			if(message.status_code != 200)
				showError("Could not connect to server. URL wrong?");

			let res = Soup.xmlrpc_parse_method_response(request.response_body.data, -1, {});
			let id = res[1];

			if(id == false)
				showError("Could not login to server. User or password wrong?");
			else{
				controller.extension.userId = id;
				global.log("OpenERP got user ID: "+controller.extension.userId);
				callback();
			}
		});
	},

	callApi: function(){
		if(controller.extension.userId == -1)
			return;

		let request = Soup.Message.new('POST', controller.extension.settings.get_string("host")+"/xmlrpc/object");

		let sendData = [controller.extension.settings.get_string("database"), controller.extension.userId, controller.extension.settings.get_string("pass"), 'res.partner', 'read', 0];
		let rpcCall = Soup.xmlrpc_build_method_call("execute", sendData, sendData.length);
		request.set_request("text/xml", Soup.MemoryUse.COPY, rpcCall, rpcCall.length);

		global.log(sendData);

		_httpSession.queue_message(request, function(_httpSession, message) {
			if(message.status_code != 200)
				showError("Could not connect to server. URL wrong?");

			global.log(request.response_body.data);

			//let res = Soup.xmlrpc_parse_method_response(request.response_body.data, -1, {});
			//global.log(res);
		});
	}
}

function _statusChanged(){
	global.log("HELLO DU DA");
}

function ExtensionController(extensionMeta) {
	//let dateMenu = Main.panel.statusArea.dateMenu;

	return {
		extensionMeta: extensionMeta,
		extension: null,
		settings: null,


		enable: function() {
			controller = this;

			this.extension = new OpenErpExtension(this.extensionMeta);
			this.extension.login(this.extension.callApi);

			Main.panel.addToStatusArea("openerp", this.extension, 0, "right");

			Main.panel.menuManager.addMenu(this.extension.menu);
		},

		disable: function(){
			Main.panel.menuManager.removeMenu(this.extension.menu);

			if(this.extension.timeout != undefined)
				GLib.source_remove(this.extension.timeout);

			this.extension.actor.destroy();
			this.extension.destroy();
			this.extension = null;
		}
		
	}

}

function init(extensionMeta) {
	return new ExtensionController(extensionMeta);
}
