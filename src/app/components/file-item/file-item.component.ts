import { Component, Input, OnInit } from '@angular/core';
import { i_File } from '../../../../schemas';

@Component({
  selector: 'app-file-item',
  templateUrl: './file-item.component.html',
  styleUrls: ['./file-item.component.scss']
})
export class FileItemComponent implements OnInit {
  @Input() dataRecord:i_File;
  constructor() { }

  ngOnInit(): void {
   console.log("I'm awake") 
  }

}
