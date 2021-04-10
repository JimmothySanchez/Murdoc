import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { i_Configuration } from '../../../../schemas'
import { ElectronService } from '../../core/services/electron/electron.service';

@Component({
  selector: 'app-edit-config',
  templateUrl: './edit-config.component.html',
  styleUrls: ['./edit-config.component.scss']
})
export class EditConfigComponent implements OnInit {
  removable: boolean = true;
  extNew:string;
  constructor(
    public dialogRef: MatDialogRef<EditConfigComponent>,
    @Inject(MAT_DIALOG_DATA) public data: i_Configuration,
    private electronService: ElectronService,
    private _cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
  }

  onCloseClick(): void {
    console.log('closing dialog')
    this.dialogRef.close();
    this._cdr.detectChanges();
  }

  onSaveClick(): void {
    console.log('saving dialog')
    this.electronService.ipcRenderer.send('fe-update-config',this.data);
    this.dialogRef.close();
    this._cdr.detectChanges();
  }

  remove(path: string): void {
    console.log('Removing file path %s', path);
    this.data.filePaths = this.data.filePaths.filter(x => x !== path);
  }

  removeExt(ext: string): void {
    this.data.videoExtensions = this.data.videoExtensions.filter(x => x !== ext);
  }

  addExtClick(): void {
    console.log(this.extNew);
    this.data.videoExtensions.push(this.extNew);
    this.extNew ="";
    this._cdr.detectChanges();
  }

  addDirClick(): void {
    let dirProm = this.electronService.dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    dirProm.then((val)=>{
      console.log('Adding directory');
      this.data.filePaths= this.data.filePaths.concat(val.filePaths);
      this._cdr.detectChanges();
    });
  }

  setThumbClick(): void {
    let dirProm = this.electronService.dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    dirProm.then((val)=>{
      this.data.thumbPath=val.filePaths[0];
    });
  }
}
