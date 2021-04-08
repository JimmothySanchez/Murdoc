import { Component, OnInit,Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss']
})
export class FileListComponent implements OnInit {
  @Output() textUpdateEvent = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }
  
  UpdateText(newText:string):void{

  }

}
