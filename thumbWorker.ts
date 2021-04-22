import * as fluentmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as ffmpeg from 'ffmpeg';
import * as path from 'path';

function defaultReply(message) {
    // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
    // do something
}

function reply() {

}

onmessage = function (oEvent) {
    console.log('worker started');
    let args =oEvent.data
    let shotprom = TakeFastShots(args.file,args.tempdirPath);
    shotprom.then(files=>{
        postMessage(files,'');
    });
};

function TakeFastShots(file: string, tempdirPath: string, shotIndex: number = 0): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let filenames: string[] = [];
      fluentmpeg(file).on('error', function (err) {
        reject(err);
      })
        .on("filenames", (names) => {
          names.forEach(name => {
            filenames.push(path.resolve(tempdirPath, name));
          });
        })
        .on("end", () => {
          if (shotIndex < this.thumbnailCount - 1) {
            let fastProm = TakeFastShots(file, tempdirPath, shotIndex + 1);
            fastProm.then(recuresedNames => {
              resolve(filenames.concat(recuresedNames));
            });
          } else {
            resolve(filenames);
          }
        })
        .screenshots({
          filename: 't-%s.png',
          folder: tempdirPath,
          size: this.thumbnailWidth + 'x' + this.thumbnailHeight,
          count: 1,
          timemarks: [`${5 + (90 / this.thumbnailCount) * shotIndex}%`]
        });
    });
  }