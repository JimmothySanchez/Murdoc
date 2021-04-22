import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as ffmpeg from 'ffmpeg';
import * as sharp from 'sharp';
import * as fluentmpeg from 'fluent-ffmpeg';
import { resolve } from 'node:path';
import { i_File, i_MainSchema } from './schemas';
import { Guid } from "guid-typescript";
import { worker } from 'node:cluster';
import * as tumbWorker from './thumbWorker';
 

export class Thumbs {
  thumbnailCount: number;
  thumbnailsPerRow: number;
  thumbnailWidth: number;
  thumbnailHeight: number;

  constructor(options) {
    this.thumbnailCount = options.thumbnailCount || 30;
    this.thumbnailsPerRow = options.thumbnailsPerRow || 10;
    this.thumbnailWidth = options.thumbnailWidth || (!!options.thumbnailHeight ? 0 : 120);
    this.thumbnailHeight = options.thumbnailHeight || (!!options.thumbnailWidth ? 0 : 66);
  }

  private _MakeDirectory(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.mkdir(path, { recursive: true }, function (err) {
        if (err == null) {
          resolve(path);
        }
        else {
          reject(err);
        }
      });
    });
  };

  private _TakeFastShots(file: string, tempdirPath: string, shotIndex: number = 0): Promise<string[]> {
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
            let fastProm = this._TakeFastShots(file, tempdirPath, shotIndex + 1);
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

  private _CleanUpTemporaryFiles(path: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.rmdir(path, { recursive: true }, () => {
        resolve('success');
      });
    });
  }

  private _GenerateTempFiles(sourcePath: string, tempdirPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      let filenames = [];
      fluentmpeg(sourcePath).on('error', function (err) {
        reject(err);
      }).on('filenames', (names) => {
        names.forEach(name => {
          filenames.push(path.resolve(tempdirPath, name));
        });
      }).on('end', () => {
        resolve(filenames);
      }).screenshots({
        filename: 't-%s.png',
        folder: tempdirPath,
        size: this.thumbnailWidth + 'x' + this.thumbnailHeight,
        count: this.thumbnailCount
      });
    });
  }

  private _CombineThumbs(filenames: string[], thumbnailPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const compositeInput = [];
      let xOffset = 0;
      let yOffset = 0;

      if (filenames.length === 0) {
        resolve('No files');
      }

      for (let i = 0; i < filenames.length; i++) {
        compositeInput.push({
          input: filenames[i],
          left: xOffset,
          top: yOffset,
        });

        xOffset += this.thumbnailWidth;
        if ((i + 1) % this.thumbnailsPerRow === 0) {
          xOffset = 0;
          yOffset += this.thumbnailHeight;
        }
      }


      sharp({
        create: {
          width: this.thumbnailsPerRow * this.thumbnailWidth,
          height: Math.ceil(filenames.length / this.thumbnailsPerRow) * this.thumbnailHeight,
          channels: 3,
          background: '#000',
        },
      }).composite(compositeInput).toFile(thumbnailPath, function (err, output) {
        if (err == null) {
          resolve('Success');
        }
        else {
          reject(err);
        }
      });

    });
  }

  GenerateGalleryImage(file: i_File, outPath: string, tempDirectory: string): Promise<any> {
    return new Promise((resolve, reject) => {
      //let tempDirectory = path.resolve(__dirname, 'temp',  file.Id );
      //Make the directory
      this._MakeDirectory(tempDirectory).then((dirStatus) => {
        //Then generate temporary files
        //this._GenerateTempFiles(file.FullPath, tempDirectory).then((fileNames) => {
        this._TakeFastShots(file.FullPath, tempDirectory, 0).then((fileNames) => {
          //Then generate merge image
          this._CombineThumbs(fileNames, outPath).then((combineStatus) => {
            this._CleanUpTemporaryFiles(tempDirectory);
            resolve(combineStatus);
            //Then clean up
          });
        });
      });
    });
  }
}