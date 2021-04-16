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
//import {Datastore} from 'nedb-promises';
const Datastore = require('nedb-promises');

var PromisePool = require('es6-promise-pool')
export class DataManager {
    private _safeToGenerate: boolean = true;
    private _config: i_Configuration;
    private _dataStore: any;
    private _dataUpdater;
    private _root: string;
    constructor(Dataupdater) {
        this._setRoot();
        this.LoadConfig();
        this.LoadDb();
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

    private _setRoot(): void {
        if (process.env.PORTABLE_EXECUTABLE_DIR !== null && process.env.PORTABLE_EXECUTABLE_DIR !== undefined) {
            this._root = process.env.PORTABLE_EXECUTABLE_DIR;
        }
        else {
            this._root = __dirname;
        }
        console.log(this._root);
    }


    SaveConfig(): void {
        console.log("Creating config.")
        fs.writeFileSync(path.resolve(this._root, 'MurdocConfig.json'), JSON.stringify(this._config));
    }

    LoadConfig(): void {
        try {
            let rawdata: Buffer = fs.readFileSync(path.resolve(this._root, 'MurdocConfig.json'));
            this._config = <i_Configuration>JSON.parse(rawdata.toString());
        } catch (exception) {
            console.log("Could not find configuration. Making one instead.");
            this._config = { filePaths: [], thumbPath: "", videoExtensions: [] };
        }
    }


    SimpleScanDirectories(): Promise<any> {
        return new Promise((resolve, reject) => {
            let scanProms = [];
            this._config.filePaths.forEach(directory => {
                scanProms.push(this._getFiles(directory));
            });
            Promise.all(scanProms).then(dirs => {
                let insProms = [];
                let findProms =[];
                dirs.forEach(dir => {
                    dir.forEach(filepath => {
                        //if is a valid extension
                        if (this._config.videoExtensions.includes(path.extname(filepath))) {
                            //if not already added
                            findProms.push(this._dataStore.find({ FullPath: filepath }).then(existingrecords => {
                                if (existingrecords.length <= 0) {
                                    //add recod to db
                                    let fileTags = this._GenerateTags(filepath);
                                    insProms.push(this._dataStore.insert({ Name: path.basename(filepath).split('.')[0], FullPath: filepath, Id: Guid.raw(), Tags: fileTags, GeneratingThumb: false }));
                                }
                            }));
                        }
                    });
                });
                Promise.all(findProms).then(finds=>{
                    Promise.all(insProms).then(results=>{
                        resolve("scanning done.");  
                    });
                });
            });
        });

    }

    LoadDb() {
        try {
            this._dataStore = Datastore.create(this.GetDBPath());
        } catch (exception) {
            console.log("Could not load db");
        }
    }

    StopGeneratingThumbs(): void {
        this._safeToGenerate = false;
    }

    GetDBPath(): string {
        return path.resolve(this._root, 'MurdocData.db');
    }

    QueryData(queryFilter) {
        return this._dataStore.find(queryFilter);
    }

    GetAllData() {
        return this._dataStore.find();
    }

    //this is gross but there is no distinct in nedb
    GetAllTags() {
        return new Promise((resolve, reject) => {
            this._dataStore.find().then(results => {
                let uniques: string[] = [];
                results.forEach(result => {
                    result.Tags.forEach(tag => {
                        if (!uniques.includes(tag)) {
                            uniques.push(tag);
                        } 
                    });
                });
                resolve(uniques);
            });
        });
    }

    async GenerateThumbs() {
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
        //let filesWithoutThumbs = this._data.Files.filter(x => x.ThumbPath === null || x.ThumbPath === undefined);
        //let filesWithoutThumbs=[];
        let filesWithoutThumbs = await this._dataStore.find({ ThumbPath: { $exists: false } });

        //TODO: now that I'm using a db this can be cleaaned up alot
        let promisemaker = () => {
            if (filesWithoutThumbs.length > 0 && this._safeToGenerate) {
                return new Promise((resolve, reject) => {
                    let file: i_File = filesWithoutThumbs.pop();
                    let outPath = path.resolve(this._config.thumbPath, file.Id.toString() + '.png')
                    console.log('Generating thumbs for %s', file.Name);
                    file.GeneratingThumb = true;
                    this._dataStore.update({ Id: file.Id }, file, { upsert: true });
                    this._dataUpdater();
                    let startTime = performance.now();
                    let temporaryDir = path.resolve(this._root, 'temp', file.Id);
                    thumbs.GenerateGalleryImage(file, outPath, temporaryDir).then((status) => {
                        console.log('Finished generating thumbs for %s after %s ms', file.Name, performance.now() - startTime);
                        file.ThumbPath = outPath;
                        file.GeneratingThumb = false;
                        this._dataUpdater();
                        this._dataStore.update({ Id: file.Id }, file, { upsert: true });
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
            //this.SaveDataToDisk();
        }, (error) => {
            console.log('Some promise rejected: ' + error.message)
        });
    }

    GetData(): any {
        //return this._data;
        //TODO: return db vals
        return null;
    }

    GetConfig(): i_Configuration {
        return this._config;
    }

    SetConfig(config: i_Configuration): void {
        this._config = config;
    }
}