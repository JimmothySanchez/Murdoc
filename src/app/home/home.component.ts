import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../core/services/electron/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

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
