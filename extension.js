const Clutter = imports.gi.Clutter;
const Gettext = imports.gettext;
const Lang = imports.lang;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Pango = imports.gi.Pango;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;

const OpenErpStatusIcon = new Lang.Class({
    Name: 'OpenErpStatusIcon',
    Extends: St.BoxLayout,

    _init: function() {
        this.parent({ style_class: 'panel-status-menu-box' });

        /*
        this.add_child(new St.Icon({
            icon_name: 'edit-paste-symbolic',
            style_class: 'system-status-icon'
        }));
		*/

        this.add_child(new St.Label({
            text: 'openerp',
            y_expand: true,
            y_align: Clutter.ActorAlign.CENTER
        }));
    }
});

const OpenErpStateSwitch = new Lang.Class({
    Name: 'OpenErpStateSwitch',
    Extends: PopupMenu.PopupSwitchMenuItem,

    _init: function(client) {
        this.parent(_("track"), false);

        this._fromDaemon = false;

        this.connect('toggled', Lang.bind(this, function() {
            
        }));
    }
});

/*********************************************************************************************************************************************/
/*
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
*/
/*********************************************************************************************************************************************/
/*
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
*/

const TaskMenuItem = new Lang.Class({
    Name: 'TaskMenuItem',
    Extends: PopupMenu.PopupMenuItem,

    _init: function(client, index) {
        this.parent("");

        let text = this.label.clutter_text;
        text.max_length = 60;
        text.ellipsize = Pango.EllipsizeMode.END;
        this.label.set_text("subitem");


        this.actor.connect('key-press-event', function(actor, event) {
            let symbol = event.get_key_symbol();
            if (symbol == Clutter.KEY_BackSpace || symbol == Clutter.KEY_Delete) {
                //client.delete(index, null);
                return true;
            }
            return false;
        });

        //this.actor.add(new GPasteDeleteMenuItemPart(client, index), { expand: true, x_align: St.Align.END });
    },

    setText: function(text) {
        this.label.set_text(text);
        this.actor.show();
    }
});


const ProjectMenuItem = new Lang.Class({
    Name: 'ProjectMenuItem',
    Extends: PopupMenu.PopupSubMenuMenuItem,

    _init: function(client, index) {
        this.parent("");

        let text = this.label.clutter_text;
        text.max_length = 60;
        text.ellipsize = Pango.EllipsizeMode.END;
        this.label.set_text("PROJECT");

        this.actor.connect('key-press-event', function(actor, event) {
            let symbol = event.get_key_symbol();
            if (symbol == Clutter.KEY_BackSpace || symbol == Clutter.KEY_Delete) {
                //client.delete(index, null);
                return true;
            }
            return false;
        });

        //this.actor.add(new GPasteDeleteMenuItemPart(client, index), { expand: true, x_align: St.Align.END });
    },

    setText: function(text) {
        this.label.set_text(text);
        this.actor.show();
    }
});


/*****************************************************************************************************************************************/

const OpenErpIndicator = new Lang.Class({
    Name: 'OpenErpIndicator',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, "OpenERP");

        this.actor.add_child(new OpenErpStatusIcon());

		this.menu.addMenuItem(new OpenErpStateSwitch(null));

		this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

		for(let i=0;i<10;i++){
			this.menu.addMenuItem(new ProjectMenuItem());
		}
    },

    shutdown: function() {
        this._onStateChanged (false);
        this.destroy();
    },

    _onStateChanged: function (state) {
        this._client.on_extension_state_changed(state, null);
    }
});

function init(extension) {
    //Gettext.bindtextdomain('openerp', extension.metadata.localedir);
}

function enable() {
    Main.panel.addToStatusArea('openerp', new OpenErpIndicator());
}

function disable() {
    Main.panel.statusArea.openerp.shutdown();
}
