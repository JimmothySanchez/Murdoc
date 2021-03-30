import * as fs from 'fs';
import * as ffmpeg from 'ffmpeg';
import * as fluentmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import { resolve } from 'node:path';
import { Thumbs} from './thumbs';

export class DataManager {
    _data = { files: [] };
    _dataUpdate = new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('foo');
        }, 300);
      });

    constructor() {

    }

    SimpleScanDirectories(directories: string[]): Promise<any> {
        return new Promise((resolve,reject)=>{
            this._data.files = [];
            directories.forEach(directory => {
                fs.readdir(directory,(err, files) => {
                    files.forEach(file => {
                        let fullPath = path.join(directory, file);
                        this._data.files.push({Name:file, FullPath:fullPath});
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

    GenerateThumbs(thumbsDir:string){
        //this._data.files.forEach((fileItem)=>{
            //this.GenerateThumb(fileItem.FullPath,path.join(thumbsDir,fileItem.Name+'.png'));
        //});
        let fileItem = this._data.files[0];
        this.GenerateThumb(fileItem.FullPath,path.join(thumbsDir,path.parse(fileItem.Name).name));
    }

    GenerateThumb(inPath:string,outPath:string){
        let options = {
            thumbnailInterval: 30,
            thumbnailsPerRow: 10,
            thumbnailWidth:120,
            thumbnailHeight:66
        };
        let thumbs:Thumbs = new Thumbs(options);
        thumbs.GenerateGalleryImage(inPath,outPath).then((status)=>{
            let crapvar = '';
        });
    }
}