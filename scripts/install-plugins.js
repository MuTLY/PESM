#!/usr/bin/env node

//this hook installs all your plug-ins
// add your plug-ins to this list--either the identifier, the file system location or the URL
var pluginlist = [
    "com.wordsbaking.cordova.fix-wp-bouncing",
    "cordova-plugin-console",
    "cordova-plugin-device",
    "cordova-plugin-geolocation",
    "cordova-plugin-splashscreen",
    "cordova-plugin-statusbar",
    "cordova-plugin-vibration",
    "cordova-plugin-whitelist"
];

// no need to configure below
var fs = require('fs');
var path = require('path');
var sys = require('sys');
var exec = require('child_process').exec;

function puts(error, stdout, stderr) {
    sys.puts(stdout);
}

pluginlist.forEach(function(plug) {
    exec("cordova plugin add " + plug, puts);
});
