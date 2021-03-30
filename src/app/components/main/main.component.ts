import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../../core/services/electron/electron.service';
import { FileSearchComponent } from '../file-search/file-search.component';
import { FileItemComponent} from '../file-item/file-item.component'


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  data:any = null;
  constructor(private router: Router, private electronService: ElectronService,private _cdr: ChangeDetectorRef ) {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.on('update-data', (event, arg) => {
        console.log('Updating Data..')
        this.data = arg;
        console.log(this.data);
        //this._cdr.detectChanges();
      });
      this.electronService.ipcRenderer.send('init-ipc', 'ping');
    }
  }

  ping() {
    console.log('ping');
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.send('init-ipc', 'ping');
    }
  }

  ngOnInit(): void {
  }

}
