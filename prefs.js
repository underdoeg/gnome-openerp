const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Lang = imports.lang;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const OpenErpSettingsWidget = new GObject.Class({
    Name: 'OpenErp.Prefs.HamsterSettingsWidget',
    GTypeName: 'OpenErpSettingsWidget',
    Extends: Gtk.VBox,

    _init : function(params) {

    	this.parent(params);

    	this.margin = 10;

    	this._settings = Convenience.getSettings();

    	let vbox, label, entry;

    	

        vbox = new Gtk.VBox({margin: this.margin});
        this.add(vbox);

        label = new Gtk.Label();
        label.set_markup("Host");
        label.set_alignment(0, 0.5);
        vbox.add(label);

        entry = new Gtk.Entry();
        entry.set_text(this._settings.get_string("host"));
        vbox.add(entry);

        entry.connect('changed', Lang.bind(this, this._hostChanged));


        label = new Gtk.Label({margin_top: 20});
        label.set_markup("Database");
        label.set_alignment(0, 0.5);
        vbox.add(label);

        entry = new Gtk.Entry();
        entry.set_text(this._settings.get_string("database"));
        vbox.add(entry);

        entry.connect('changed', Lang.bind(this, this._dbChanged));


        label = new Gtk.Label({margin_top: 20});
        label.set_markup("User");
        label.set_alignment(0, 0.5);
        vbox.add(label);

        entry = new Gtk.Entry();
        entry.set_text(this._settings.get_string("user"));
        vbox.add(entry);

        entry.connect('changed', Lang.bind(this, this._userChanged));


        label = new Gtk.Label({margin_top: 20});
        label.set_markup("Password (warning: stored as plain text)");
        label.set_alignment(0, 0.5);
        vbox.add(label);

        entry = new Gtk.Entry();
        entry.set_text("test");
        entry.set_visibility(false);
        vbox.add(entry);

        entry.connect('changed', Lang.bind(this, this._passChanged));
    },

    _hostChanged: function(widget) {
    	let txt = widget.get_text();
    	if (this._settings.get_string("host") == txt)
            return;

        this._settings.set_string("host", txt)
    },

    _dbChanged: function(widget) {
    	let txt = widget.get_text();
    	if (this._settings.get_string("database") == txt)
            return;

        this._settings.set_string("database", txt)
    },

    _userChanged: function(widget) {
    	let txt = widget.get_text();
    	if (this._settings.get_string("user") == txt)
            return;

        this._settings.set_string("user", txt)
    },

    _passChanged: function(widget) {
    	let txt = widget.get_text();
    	if (this._settings.get_string("pass") == txt)
            return;

        this._settings.set_string("pass", txt)
    }
});

function init() {

}

function buildPrefsWidget() {
    let widget = new OpenErpSettingsWidget();
    widget.show_all();

    return widget;
}