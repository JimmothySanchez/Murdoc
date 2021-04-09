'use strict';
var packager = require('electron-packager');
var options = {
    'arch': 'ia32',
    'platform': 'win32',
    'dir': './',
    'app-copyright': 'UndeadDev',
    'app-version': '1.0.0',
    'asar': true,
    'icon': './build/icon.ico',
    'name': 'Murdoc',
    'out': './releases',
    'overwrite': true,
    'prune': true,
    'version': '9.0.6',
    'version-string': {
        'CompanyName': 'Undead Dev',
        'FileDescription': 'Undead Dev', /*This is what display windows on task manager, shortcut and process*/
        'OriginalFilename': 'Murdoc',
        'ProductName': 'Murdoc',
        'InternalName': 'Murdoc'
    }
};
packager(options, function done_callback(err, appPaths) {
    console.log("Error: ", err);
    console.log("appPaths: ", appPaths);
});