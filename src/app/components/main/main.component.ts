import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../../core/services/electron/electron.service';
import { FileSearchComponent } from '../file-search/file-search.component';
import { PreviewComponent } from '../preview/preview.component';
import { FileItemComponent} from '../file-item/file-item.component'
import {i_File, i_MainSchema} from '../../../../schemas'


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  data:i_MainSchema = {Files:[]};
  selectedFile:i_File;

  constructor(private router: Router, private electronService: ElectronService,private _cdr: ChangeDetectorRef ) {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.on('update-data', (event, arg) => {
        console.log('Updating Data..')
        this.data = arg;
        console.log(this.data);
        this._cdr.detectChanges();
      });
      this.electronService.ipcRenderer.send('init-ipc', 'ping');
    }
  }

  UpdateSelected(newSelected:i_File):void{
    this.selectedFile= newSelected;
    console.log("selected %s", this.selectedFile.Name);
    this._cdr.detectChanges();
  }
  // ping() {
  //   console.log('ping');
  //   if (this.electronService.isElectron) {
  //     this.electronService.ipcRenderer.send('init-ipc', 'ping');
  //   }
  // }

  ngOnInit(): void {
  }

}
