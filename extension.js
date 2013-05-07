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
//const Manager = CoverflowAltTab.imports.manager;

const ApiProxyIface = <interface name="com.example.TestService">
<signal name="HelloSignal"></signal>
<signal name="ActivitiesChanged"></signal>
<signal name="TagsChanged"></signal>
</interface>;

let ApiProxy = Gio.DBusProxy.makeProxyWrapper(ApiProxyIface);

//let text, button;

/*
function _hideHello() {
    Main.uiGroup.remove_actor(text);
    text = null;
}

function _showHello() {
    if (!text) {
        text = new St.Label({ style_class: 'helloworld-label', text: "Hello, world!" });
        Main.uiGroup.add_actor(text);
    }

    text.opacity = 255;

    let monitor = Main.layoutManager.primaryMonitor;

    text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
                      Math.floor(monitor.height / 2 - text.height / 2));

    Tweener.addTween(text,
                     { opacity: 0,
                       time: 2,
                       transition: 'easeOutQuad',
                       onComplete: _hideHello });
}
*/

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

    this.extensionMeta = extensionMeta;
    
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
     let categoryMenuItem = new CategoryMenuItem();
     this.projectsBox.add_actor(categoryMenuItem.actor);
   }

   this.rightBox = new St.BoxLayout({ vertical: true });
   this.mainBox.add(this.rightBox);




    //this.mainBox.add(this.projectsScrollBox, { expand: true, x_fill: true, y_fill: true });

    /*
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


    this.mainBox.style=('width: 440px;');
    this.mainBox.style+=('height: 500px;');

    this._proxy = new ApiProxy(Gio.DBus.session, 'com.example.TestService', '/com/example/TestService');
    this._proxy.connectSignal('HelloSignal',      Lang.bind(this, this.refresh));

    //this.timeout = GLib.timeout_add_seconds(0, 60, Lang.bind(this, this.refresh));
  },

  _display: function() {
  },

  _onStopTracking: function(){
    global.log("STOP THE TRACKER");
  },

  refresh: function(proxy, sender) {
    global.log("HI THERE");
    return true;
  },
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
      this.extension = new OpenErpExtension(this.extensionMeta);

      Main.panel.addToStatusArea("openerp", this.extension, 0, "right");

      Main.panel.menuManager.addMenu(this.extension.menu);


    },

    
  }


    /*
    load_json_async: function(url, fun)
    {
      let here = this;

      let message = Soup.Message.new('GET', url);

      _httpSession.queue_message(message, function(_httpSession, message)
      {
        if(!message.response_body.data)
        {
          fun.call(here,0);
          return 0;
        }

        try
        {
          let jp = JSON.parse(message.response_body.data);
          fun.call(here, jp);
        }
        catch(e)
        {
          fun.call(here,0);
          return 0;
        }
      });
      return 0;
    },
    */

  }

  function init(extensionMeta) {
    return new ExtensionController(extensionMeta);
  }

/*
function showPanel(){

}

function init() {
    button = new St.Bin({ style_class: 'panel-button',
                          reactive: true,
                          can_focus: true,
                          x_fill: true,
                          y_fill: false,
                          track_hover: true });
    let icon = new St.Icon({ icon_name: 'system-run-symbolic',
                             style_class: 'system-status-icon' });

    let box = new St.BoxLayout();
    box.set_vertical(true);

    let label = new St.Label({style_class: 'hamster-box-label'});
    label.set_text(_("What are you doing?"))
    box.add(label);

    button.set_child(icon);
    button.connect('button-press-event', showPanel);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
*/
