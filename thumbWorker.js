"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fluentmpeg = require("fluent-ffmpeg");
var path = require("path");
function defaultReply(message) {
    // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
    // do something
}
function reply() {
}
onmessage = function (oEvent) {
    console.log('worker started');
    var args = oEvent.data;
    var shotprom = TakeFastShots(args.file, args.tempdirPath);
    shotprom.then(function (files) {
        postMessage(files, '');
    });
};
function TakeFastShots(file, tempdirPath, shotIndex) {
    var _this = this;
    if (shotIndex === void 0) { shotIndex = 0; }
    return new Promise(function (resolve, reject) {
        var filenames = [];
        fluentmpeg(file).on('error', function (err) {
            reject(err);
        })
            .on("filenames", function (names) {
            names.forEach(function (name) {
                filenames.push(path.resolve(tempdirPath, name));
            });
        })
            .on("end", function () {
            if (shotIndex < _this.thumbnailCount - 1) {
                var fastProm = TakeFastShots(file, tempdirPath, shotIndex + 1);
                fastProm.then(function (recuresedNames) {
                    resolve(filenames.concat(recuresedNames));
                });
            }
            else {
                resolve(filenames);
            }
        })
            .screenshots({
            filename: 't-%s.png',
            folder: tempdirPath,
            size: _this.thumbnailWidth + 'x' + _this.thumbnailHeight,
            count: 1,
            timemarks: [5 + (90 / _this.thumbnailCount) * shotIndex + "%"]
        });
    });
}
//# sourceMappingURL=thumbWorker.js.map