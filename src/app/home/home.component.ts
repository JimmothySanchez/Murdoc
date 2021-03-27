import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {FilelistComponent} from '../filelist/filelist.component';
import { ipcRenderer} from 'electron';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    ipcRenderer.on('update-data',(event,arg)=>{
      console.log(arg);
    });
    ipcRenderer.send('init-ipc','ping');
   }
}
