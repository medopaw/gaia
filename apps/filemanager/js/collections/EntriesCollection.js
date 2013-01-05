// Entry Collection
// ===================

define(["jquery","backbone","models/EntryModel"], function($, Backbone, EntryModel) {
    var EntriesCollection = Backbone.Collection.extend({

        initialize: function() {
            console.log("Init EntriesCollection");
        },

        model: EntryModel,

        setEntries: function(entries) {
            console.log("in SetEntries(), entries="+entries);
            var modelList = [], i;
            /* $.each(entries, function(i, e) {
                console.log("entry="+e);
                var entryModel = new EntryModel({entry: e});
                // console.log(entryModel.get("entry"));
                modelList.push(entryModel);
            });*/
            for (var i = 0; i < entries.length; i++) {
                console.log("entry="+entries.item(i));
                modelList.push(new EntryModel({entry: entries.item(i)}));
            }
            this.reset(modelList);
        }
    });

    return EntriesCollection;
});
