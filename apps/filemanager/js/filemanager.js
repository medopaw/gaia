'use strict';

try {
    var sdcard = navigator.mozSDCard;
    // alert(sdcard.name);
    var root = sdcard.root;
    // alert(root.fullPath);
    var home = null;

    var errorHandler = function(e) {
        var msg = 'whatever';
        alert('Error: ' + msg);
    };
    var displayDir = function displayDir(dir) {
        // alert(dir.fullPath);
        // alert($('#path').text());
        $('#path').text(dir.fullPath);
        dir.createReader().readEntries(function(results) {
           $('#count').text(results.length + (results.length > 1 ? ' entries' : ' entry'));
           var $up = $('<div><a href="">..</a></div>');
           $up.find('a').click(function(e) {
               e.preventDefault();
               dir.getParent(function(result) {
                   displayDir(result);
               }, errorHandler);
           });
           $('#main').empty().append($up);
           for (var i = 0; i < results.length; i++) {
               var result = results.item(i);
               var $div = $('<div/>').data('entry', result);
               if (result.name == 'ThisIsACopyTest.txt') {
                   result.copyTo(home, 'test.copy.txt');
                   // var testtxt = result;
                   // alert(testtxt.name);
                   // testtxt.getParent(function(parentDir) {
                      // testtxt.copyTo(parentDir, 'test.copy.txt');
                   // });
               }
               if (result.isDirectory) {
                   $div.append($('<a/>').attr('href', '').text('[' + result.name + ']').click(function(e) {
                       e.preventDefault();
                       var entry = $(this).closest('div').data('entry');
                       if (entry.name == 'ray') {
                           home = entry;
                       }
                       displayDir(entry);
                   }));
               } else {
                   $div.text(result.name);
               }
               $div.appendTo($('#main'));
           }
       }, errorHandler);
    }

$(function() {
    displayDir(root);
});

/*
    root.getParent(function(entry) {
        // alert('parent='+entry.fullPath);
    }, function(err) {
        alert(err.name);
    });
    alert(root);
    alert(root.fullPath);
    alert(root.isDirectory);
    alert(root.filesystem); 
    var reader = root.createReader();
    alert(reader);
    // alert(reader.readEntries());
    reader.readEntries(function(entries) {
        alert(entries);
        var s = '', entry;
        alert(entries.length);
        for (var i = 0; i < entries.length; i++) {
            entry = entries.item(i);// entry = entries[i];
            if (entry.isDirectory) {
                s += '[' + entry.name + ']<br>';
            } else {
                s += entry.name + '<br>';
            }
        }
        alert(s);
        document.body.innerHTML = s;
    }, function(x) {
        alert(x);
        alert(x.name);
    });
    // alert("DirectoryReader"+navigator.mozDirectoryReader);
    // alert("DirectoryEntry="+navigator.mozDirectoryEntry);
    // alert("fullPath="+navigator.mozDirectoryEntry.fullPath);
    // alert(navigator.mozSDCard.root);
    // alert(navigator.mozSDCard.root.fullPath);
    */
} catch (ex) {
    alert(ex);
}
