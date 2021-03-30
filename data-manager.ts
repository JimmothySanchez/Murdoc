import * as fs from 'fs';
import * as ffmpeg from 'ffmpeg';
import * as fluentmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { resolve } from 'node:path';
import { Thumbs } from './thumbs';
import { Console } from 'node:console';

var PromisePool = require('es6-promise-pool')
export class DataManager {
    _data = { files: [] };
    _dataUpdate = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('foo');
        }, 300);
    });

    constructor() {

    }

    private _GetFilesWithoutThumbs(): string[] {
        let rtrnlist = [];
        this._data.files.forEach((file) => {
            if (file.Thumb == null) {
                rtrnlist.push(file.FullPath);
            }
        });
        return rtrnlist;
    }

    SimpleScanDirectories(directories: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this._data.files = [];
            directories.forEach(directory => {
                fs.readdir(directory, (err, files) => {
                    files.forEach(file => {
                        let fullPath = path.join(directory, file);
                        this._data.files.push({ Name: file, FullPath: fullPath });
                    });
                    this.SaveDataToDisk();
                    resolve(this._data);
                });
            });
        });
    }

    ScanDirectories(directories: string[]): void {
        this._data.files = [];
        directories.forEach(directory => {
            console.log('Config Paths: %s', directory);
            let probes = [];
            fs.readdir(directory, (err, files) => {
                files.forEach(file => {
                    let fullpath = path.join(directory, file);
                    //probes.push(this.GetInfoFromFile(fullpath, file, this._data.files));
                });
            });
            Promise.all(probes).then((values) => {
                console.log('All Scans returned');
                this.SaveDataToDisk();
            });
        });
    }

    GetInfoFromFile(filePath: string, fileName: string, files: any[]) {
        let probe = fluentmpeg.ffprobe(filePath, function (err, metadata) {
            let item = { name: fileName, fullpath: filePath, metadata: metadata }
            console.log('Filepath: %s', filePath);
            console.log(metadata);
            files.push(item);
        });
        return probe;
    }

    SaveDataToDisk() {
        fs.writeFileSync(path.resolve(__dirname, 'MurdocData.json'), JSON.stringify(this._data));
    }

    private startGenerator(): Promise<any> {
        return new Promise((resolve, reject) => {

        });
    }

    GenerateThumbs(thumbsDir: string) {
        let concurrentlimit = 5
        let activegenerators = [];
        let options = {
            thumbnailCount: 25,
            thumbnailsPerRow: 5,
            thumbnailWidth: 256,
            thumbnailHeight: 125
        };
        let thumbs: Thumbs = new Thumbs(options);
        let files = this._GetFilesWithoutThumbs();


        let promisemaker = () => {
            if (files.length > 0) {
                return new Promise((resolve, reject) => {
                    let filepath = files.pop();
                    let outPath = path.resolve(thumbsDir, path.parse(filepath).name + '.png')
                    console.log('Generating thumbs for %s', path.parse(filepath).name);
                    thumbs.GenerateGalleryImage(filepath, outPath).then((status) => {
                        console.log('Finished generating thumbs for %s', filepath);
                        this._data.files.find(x => x.FullPath == filepath).Thumb = outPath;
                        let test = this._data.files.find(x => x.FullPath == filepath);
                        resolve(outPath);
                    });
                });
            }
            return null;
        };

        var pool = new PromisePool(promisemaker, concurrentlimit);
        var poolPromise = pool.start();
        poolPromise.then(() =>{
            console.log('All thmbs generated')
          }, (error) =>{
            console.log('Some promise rejected: ' + error.message)
          });
          

        // for (let i = 0; i < concurrentlimit; i++) {
        //     if (files.length > 0) {
        //         let filepath = files.pop();
        //         let outPath = path.resolve(thumbsDir, path.parse(filepath).name + '.png')
        //         console.log('Generating thumbs for %s', path.parse(filepath).name);
        //         thumbs.GenerateGalleryImage(filepath, outPath).then((status) => {
        //             console.log('Finished generating thumbs for %s', filepath);
        //             this._data.files.find(x => x.FullPath == filepath).Thumb = outPath;
        //         });
        //     }
        // }
        // for( let i=0;i<5;i++)
        // {
        //     let fileItem = this._data.files[i];
        //     let outPath =  path.resolve(thumbsDir,path.parse(fileItem.Name).name+'.png')
        //     console.log('Generating thumbs for %s',fileItem.Name);
        //     thumbs.GenerateGalleryImage(fileItem.FullPath,outPath).then((status)=>{
        //         console.log('Finished generating thumbs for %s',fileItem.Name);
        //     });
        // }
    }
}