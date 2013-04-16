// App View
// =============

define(["jquery", "backbone", "utils", "models/AppModel", "models/EntryModel", "views/EntriesView"], function($, Backbone, Utils, AppModel, EntryModel, EntriesView) {

    var AppView = Backbone.View.extend( {

        templates: {
            header: function(dir) {
                return _.template($("script#header-template").html(), {dir: dir})
            },
            footer: _.template($("script#footer-template").html())
        },

        events: {
            "tap #up-button": "onTapUpButton",
            "tap #edit-button": "onTapEditButton",
            "tap #copy-button": "onTapCopyButton",
            "tap #cut-button": "onTapCutButton",
            "tap #paste-button": "onTapPasteButton",
            "tap #delete-button": "onTapDeleteButton",
            "tap #rename-button": "onTapRenameButton",
            "tap #create-button": "onTapCreateButton",
            "taphold": "onTaphold"
        },

        initialize: function() {
            console.log("Init AppView");
            this.entriesView = new EntriesView({
                el: "#entries",
                owner: this
            });
            this.model = new AppModel({mode: "Browse"});
            // dirEntry must be set after event binding
            this.model.on("change:dirEntry", this.setupPage, this);
            this.model.on("change:mode", this.changeMode, this);
            // this.model.set("dirEntry", navigator.mozSDCard.root);
        },

        render: function() {
            console.log("Render Appview");
            this.$el.find("#header").html(this.templates.header(this.model.get("dirEntry")));//.trigger("create");
            // console.log(this.templates.edit.toString());
            this.$el.find("#footer").html(this.templates.footer());//.trigger("create");
            this.$el.trigger("create");
            // this.$el.find("#footer").html(_.template($("script#edit-template").html())).trigger("create");
            /* var $div = $("div");
            $div.html($("script#edit-template").html());
            this.$el.find("#edit").append($div); */
            return this;
        },

        enableButtons: function(names) {
            var that = this;
            // in $.each, this is the value
            $.each(names, function() {
                that.$el.find("#footer #%0-button".format(this)).removeClass("ui-disabled");
            });
        },

        disableButtons: function(names) {
            var that = this;
            $.each(names, function() {
                that.$el.find("#footer #%0-button".format(this)).addClass("ui-disabled");
            });
        },

        onTapUpButton: function() {
            console.log("In goUpDir()");
            if (this.model.get("mode") == "Edit") {
                this.model.set("mode", "Browse");
            }
            var dirEntry = this.model.get("dirEntry"), that = this;
            dirEntry.getParent(function(result) {
                that.model.set("dirEntry", result);
            }, Utils.errorHandler);
        },

        onTapEditButton: function(e) {
            this.onTaphold(e);
        },

        onTapCopyButton: function() {
            console.log(this.entriesView.collection);
            Utils.refreshClipboard(this.entriesView.collection);
            Utils.clipboard.action = "Copy";
            if (Utils.clipboard.length) {
                this.enableButtons(["paste"]);
            }
            this.model.set("mode", "Browse");
        },

        onTapCutButton: function() {
            Utils.refreshClipboard(this.entriesView.collection);
            Utils.clipboard.action = "Move";
            if (Utils.clipboard.length) {
                this.enableButtons(["paste"]);
            }
            this.model.set("mode", "Browse");
        },

        onTapPasteButton: function() {
            var entriesCollection = this.entriesView.collection, clipboard = Utils.clipboard;
            var that = this, parentDirEntry = this.model.get("dirEntry");
            console.log("%0 entries in clipboard".format(clipboard.length));
            var successHandler = function(result) {
                // current dir may have changed
                that.refreshPageOnNeed(parentDirEntry.fullPath);
                /*
                if (that.model.get("dirEntry").fullPath == parentDirEntry.fullPath) {
                    var entryModel = new EntryModel({entry: result});
                    entriesCollection.add(entryModel);
                }
                */
            };
            for (var i = 0; i < clipboard.length; i++) {
                console.log(clipboard.action);
                switch (clipboard.action) {
                    case "Copy": {
                        // clipboard[i].copyTo(parentDirEntry, "", successHandler, Utils.errorHandler);
                        clipboard[i].copyTo(parentDirEntry, clipboard[i].name, successHandler, Utils.errorHandler);
                        break;
                    }
                    case "Move": {
                        // clipboard[i].moveTo(parentDirEntry, "", successHandler, Utils.errorHandler);
                        clipboard[i].moveTo(parentDirEntry, clipboard[i].name, successHandler, Utils.errorHandler);
                        break;
                    }
                    default: {
                    }
                }
            }
            clipboard = [];
            clipboard.action = null;
            this.disableButtons(["paste"]);
            this.model.set("mode", "Browse");
        },

        onTapDeleteButton: function() {
           var entriesCollection = this.entriesView.collection;
           var curPath = this.model.get("dirEntry").fullPath;
           var that = this;
           var successHandler = function() {
               console.log("Entry removed.")
               that.refreshPageOnNeed(curPath);
           };

           var selected = Utils.getSelected(this.entriesView.collection);
           $.each(selected, function() {
               var entry = this.get("entry"); // this is EntryModel
               if (entry.isFile) {
                   entry.remove(successHandler, Utils.errorHandler);
               } else {
                   entry.removeRecursively(successHandler, Utils.errorHandler);
               }
           });
           this.model.set("mode", "Browse");
        },

        onTapRenameButton: function() {
            var name = prompt("New name:");
            if (name) {
                var parentDirEntry = this.model.get("dirEntry");
                console.log(parentDirEntry.fullPath);
                var entry = null;
                var selected = Utils.getSelected(this.entriesView.collection);
                if (selected.length == 1) {
                    var entry = selected[0];
                    var that = this;
                    entry.moveTo(parentDirEntry, name, function(result) {
                        console.log(result.fullPath);
                        // simply refresh all entries
                        that.refreshPageOnNeed(parentDirEntry.fullPath);
                    }, Utils.errorHandler);
                } else { // shouldn't come to this branch
                    alert("You can only rename one entry.");
                }
            }
            this.model.set("mode", "Browse");
        },

        onTapCreateButton: function() {
            var isFile = confirm("Create a file? (Click Cancel to create a directory)");
            var name = prompt("Name:");
            if (name) {
                var parentDirEntry = this.model.get("dirEntry");
                var options = {
                    create: true,
                    exclusive: true // return error if target file/directory exists
                };
                var that = this;
                var successHandler = function(result) {
                    that.refreshPageOnNeed(parentDirEntry.fullPath);
                };
                if (isFile) {
                    parentDirEntry.getFile(name, options, successHandler, Utils.errorHandler);
                } else {
                    parentDirEntry.getDirectory(name, options, successHandler, Utils.errorHandler);
                }
            }
            this.model.set("mode", "Browse");
        },

        onTaphold: function(e) {
            console.log("Trigger taphold event");
            e.stopPropagation();
            switch (this.model.get("mode")) {
                case "Edit": {
                    this.model.set("mode", "Browse");
                    break;
                }
                case "Browse":
                default: {
                    this.model.set("mode", "Edit");
                    break;
                }
            }
        },

        onSelectionChanged: function() {
            console.log("Selection changes.");
            var selected = Utils.getSelected(this.entriesView.collection);
            console.log(selected.length + " entry/entries selected.");
            switch (selected.length) {
                case 0: {
                    this.disableButtons(["copy", "cut", "delete", "rename"]);
                    break;
                }
                case 1: {
                    this.enableButtons(["copy", "cut", "delete", "rename"]);
                    break;
                }
                default: {
                    this.disableButtons(["rename"]);
                    break;
                }
            }
        },

        setupPage: function() {
            console.log("In setupPage()");
            var dirEntry = this.model.get("dirEntry");
            if (!dirEntry) return;

            console.log("Setup page to "+dirEntry.fullPath);
            this.render();
            // console.log(this.entriesView);
            var that = this;
            dirEntry.createReader().readEntries(function(results) {
                var entries = [];
                for (var i = 0; i < results.length; i++) {
                    entries.push(results[i]);
                }
                that.entriesView.collection.setEntries(entries);
            }, Utils.errorHandler);
        },

        refreshPageOnNeed: function(path) {
            console.log("Original directory is " + path);
            console.log("Current directory is " + this.model.get("dirEntry").fullPath);
            if (path == this.model.get("dirEntry").fullPath) {
                this.setupPage();
            }
        },

        changeMode: function() {
            switch (this.model.get("mode")) {
                case "Edit": {
                    this.$el.find("#footer").slideToggle();
                    this.onSelectionChanged();
                    Utils.clipboard.length ? this.enableButtons(["paste"]) : this.disableButtons(["paste"]);
                    break;
                }
                case "Browse": {
                    this.$el.find("#footer").slideToggle();
                    this.entriesView.collection.each(function(entryModel) {
                        if (entryModel.get("selected")) {
                            entryModel.set("selected", false);
                            Utils.switchTheme(entryModel.view.$el, "b", "c");
                        }
                    }, this);
                    break;
                }
                default: {
                }
            }
        }
    });

    return AppView;

});
