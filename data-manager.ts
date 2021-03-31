import * as fs from 'fs';
import * as ffmpeg from 'ffmpeg';
import * as fluentmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { resolve } from 'node:path';
import { Thumbs } from './thumbs';
import { Console } from 'node:console';
import { i_File, i_MainSchema } from './schemas';
import { Guid } from "guid-typescript";
import { performance } from 'perf_hooks';

var PromisePool = require('es6-promise-pool')
export class DataManager {
    _data: i_MainSchema = { Files: [] };

    constructor() {
        this.LoadFromDisk();
    }

    SimpleScanDirectories(directories: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            directories.forEach(directory => {
                fs.readdir(directory, (err, files) => {
                    files.forEach(file => {
                        let fullPath = path.join(directory, file);
                        if (this._data.Files.filter(x => x.FullPath === fullPath).length < 1) {
                            console.log('adding %s to library',file);
                            this._data.Files.push({ Name: file, FullPath: fullPath, Id: Guid.raw(), Tags: [] });
                        }
                    });
                    this.SaveDataToDisk();
                    resolve(this._data);
                });
            });
        });
    }

    // GetInfoFromFile(filePath: string, fileName: string, files: any[]) {
    //     let probe = fluentmpeg.ffprobe(filePath, function (err, metadata) {
    //         let item = { name: fileName, fullpath: filePath, metadata: metadata }
    //         console.log('Filepath: %s', filePath);
    //         console.log(metadata);
    //         files.push(item);
    //     });
    //     return probe;
    // }

    SaveDataToDisk() {
        fs.writeFileSync(path.resolve(__dirname, 'MurdocData.json'), JSON.stringify(this._data));
    }

    LoadFromDisk() {
        try {
            let rawdata: Buffer = fs.readFileSync(path.resolve(__dirname, 'MurdocData.json'));
            this._data = <i_MainSchema>JSON.parse(rawdata.toString());
            let crapvar = "";
        } catch (error) {
            console.log('Failed to load data from disk.')
        }
    }

    GenerateThumbs(thumbsDir: string) {
        let concurrentlimit = 3;
        let activegenerators = [];
        let options = {
            thumbnailCount: 25,
            thumbnailsPerRow: 5,
            thumbnailWidth: 256,
            thumbnailHeight: 125
        };
        let thumbs: Thumbs = new Thumbs(options);
        //let files = this._GetFilesWithoutThumbs();
        let filesWithoutThumbs = this._data.Files.filter(x => x.ThumbPath === null||x.ThumbPath===undefined);

        let promisemaker = () => {
            if (filesWithoutThumbs.length > 0) {
                return new Promise((resolve, reject) => {
                    let file: i_File = filesWithoutThumbs.pop();
                    let outPath = path.resolve(thumbsDir, file.Id.toString() + '.png')
                    console.log('Generating thumbs for %s', file.Name);
                    let startTime = performance.now();
                    thumbs.GenerateGalleryImage(file, outPath).then((status) => {
                        console.log('Finished generating thumbs for %s after %s ms', file.Name, performance.now() - startTime);
                        file.ThumbPath = outPath;
                        let test = this._data.Files.find(x => x.Id === file.Id);
                        resolve(outPath);
                    }).catch(err=>{
                        console.log(err);
                    });
                });
            }
            return null;
        };

        var pool = new PromisePool(promisemaker, concurrentlimit);
        var poolPromise = pool.start();
        poolPromise.then(() => {
            console.log('All thmbs generated');
            this.SaveDataToDisk();
        }, (error) => {
            console.log('Some promise rejected: ' + error.message)
        });
    }
}