// Entry View
// =============

// Includes file dependencies
define([ "jquery", "backbone","models/EntryModel" ], function($, Backbone, EntryModel) {

    var EntryView = Backbone.View.extend( {

        tagName: "li",

        template: function(entry) {
            console.log("entry="+entry);
            return _.template($("script#entry-template").html(), {entry: entry});
        },

        events: {
            "tap": "onTap"
        },

        onTap: function() {
            // console.log(this.model.get("entry").name);
            var entry = this.model.get("entry");
            if (entry.isDirectory) {
                var appView = this.owner.owner;
                appView.model.set("dirEntry", this.model.get("entry"));
            }
        },

        initialize: function() {
            console.log("Init EntryView");
            this.model.on("change", this.render);
            this.model.on("destroy", this.remove);
        },

        render: function() {
            console.log("Render entry");
            // this.$el.addClass("ui-li ui-li-static ui-btn-up-c ui-corner-top");
            this.$el.addClass("ui-li ui-li-static ui-btn-up-c");
            console.log("entry="+this.model.get("entry"));
            this.$el.html(this.template(this.model.get("entry")));
            return this;
        }

    } );

    return EntryView;
});
