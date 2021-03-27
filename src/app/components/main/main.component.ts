import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../../core/services/electron/electron.service';
import { FileSearchComponent } from '../file-search/file-search.component';
import { FileListComponent } from '../file-list/file-list.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor(private router: Router, private electronService: ElectronService) {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.on('update-data', (event, arg) => {
        console.log(arg);
      });
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
