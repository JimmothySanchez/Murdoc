import * as fs from 'fs';
import * as ffmpeg from 'ffmpeg';
import * as fluentmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { resolve } from 'node:path';
import { Thumbs } from './thumbs';
import { Console, groupCollapsed } from 'node:console';
import { i_Configuration, i_File, i_MainSchema } from './schemas';
import { Guid } from "guid-typescript";
import { performance } from 'perf_hooks';

var PromisePool = require('es6-promise-pool')
export class DataManager {
    private _data: i_MainSchema = { Files: [], TagOptions: [] };
    private _safeToGenerate: boolean = true;
    private _config: i_Configuration;
    private _dataUpdater;
    constructor(config: i_Configuration, Dataupdater) {
        this.LoadFromDisk();
        this._config = config;
        this._dataUpdater = Dataupdater;
    }

    //tag every folder startign with initial directory and including initial directory
    private _GenerateTags(fullPath: string): string[] {
        let rtrnvals = []
        let initialDirectory = this._config.filePaths.filter(x => fullPath.indexOf(x) !== -1)[0];
        if (initialDirectory !== null && initialDirectory !== undefined) {
            rtrnvals = fullPath.split(initialDirectory)[1].split(path.sep).filter(x => x !== '').slice(0, -1);
            let initialparts = initialDirectory.split(path.sep);
            rtrnvals.push(initialparts[initialparts.length - 1]);
        }
        return rtrnvals;
    }

    private async _getFiles(dir: string) {
        let subdirs = await fs.promises.readdir(dir);
        let files = await Promise.all(subdirs.map(async (subdir) => {
            let res = path.resolve(dir, subdir);
            return (await fs.promises.stat(res)).isDirectory() ? this._getFiles(res) : res;
        }));
        return files.reduce((a, f) => a.concat(f), []);
    }


    private _ScanDirRecursive(directoryPath: string, startingDirectory: string) {
        let dirProms = [];
        fs.promises.readdir(directoryPath).then(filenames => {
            filenames.forEach(file => {
                let fullPathToFile = path.join(directoryPath, file);
                if (fs.lstatSync(fullPathToFile).isDirectory()) {
                    dirProms.push(this._ScanDirRecursive(fullPathToFile, startingDirectory));
                }
            });
        });
    }

    SimpleScanDirectories(): Promise<any> {
        return new Promise((resolve, reject) => {
            let scanProms = [];
            this._config.filePaths.forEach(directory => {
                scanProms.push(this._getFiles(directory));
            });
            Promise.all(scanProms).then(dirs => {
                dirs.forEach(dir => {
                    dir.forEach(filepath => {
                        let fileTags = this._GenerateTags(filepath);
                        this._data.Files.push({ Name: path.basename(filepath).split('.')[0], FullPath: filepath, Id: Guid.raw(), Tags: fileTags, GeneratingThumb: false });
                        let uniqueTags = fileTags.filter(x=>{return this._data.TagOptions.indexOf(x)===-1 });
                        this._data.TagOptions= this._data.TagOptions.concat(uniqueTags);
                    });
                });
                resolve(this._data);
            });
        });

    }

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

    StopGeneratingThumbs(): void {
        this._safeToGenerate = false;
    }

    GenerateThumbs() {
        let concurrentlimit = 3;
        let activegenerators = [];
        let options = {
            thumbnailCount: 25,
            thumbnailsPerRow: 5,
            thumbnailWidth: 256,
            thumbnailHeight: 125
        };
        this._safeToGenerate = true;
        let thumbs: Thumbs = new Thumbs(options);
        let filesWithoutThumbs = this._data.Files.filter(x => x.ThumbPath === null || x.ThumbPath === undefined);

        let promisemaker = () => {
            if (filesWithoutThumbs.length > 0 && this._safeToGenerate) {
                return new Promise((resolve, reject) => {
                    let file: i_File = filesWithoutThumbs.pop();
                    let outPath = path.resolve(this._config.thumbPath, file.Id.toString() + '.png')
                    console.log('Generating thumbs for %s', file.Name);
                    file.GeneratingThumb = true;
                    this._dataUpdater();
                    let startTime = performance.now();
                    thumbs.GenerateGalleryImage(file, outPath).then((status) => {
                        console.log('Finished generating thumbs for %s after %s ms', file.Name, performance.now() - startTime);
                        file.ThumbPath = outPath;
                        file.GeneratingThumb = false;
                        this._dataUpdater();
                        resolve(outPath);
                    }).catch(err => {
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

    GetData(): i_MainSchema {
        return this._data;
    }
}