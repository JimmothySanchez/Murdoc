import { Component, Input,Output, EventEmitter, OnInit } from '@angular/core';
import { i_File } from '../../../../schemas';
import { ElectronService } from '../../core/services/electron/electron.service';

@Component({
  selector: 'app-file-item',
  templateUrl: './file-item.component.html',
  styleUrls: ['./file-item.component.scss']
})
export class FileItemComponent implements OnInit {
  @Input() dataRecord:i_File;
  @Output() SelectEvent = new EventEmitter<i_File>();
  constructor(  private electronService: ElectronService) { }

  Selected():void {
    this.SelectEvent.emit(this.dataRecord);
    //this.electronService.shell.openPath(this.dataRecord.FullPath);
  }

  ngOnInit(): void {

  }

}
