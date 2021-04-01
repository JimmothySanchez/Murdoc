import { Component, Input,Output, EventEmitter, OnInit } from '@angular/core';
import { ElectronService } from '../../core/services/electron/electron.service';
import { i_File } from '../../../../schemas';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {
  @Input() dataRecord:i_File;
  constructor( private electronService: ElectronService ) { }

  LoadFile():void{
    this.electronService.shell.openPath(this.dataRecord.FullPath);
  }
  
  ngOnInit(): void {
  }

}
