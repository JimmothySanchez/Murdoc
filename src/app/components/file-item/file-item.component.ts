import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-item',
  templateUrl: './file-item.component.html',
  styleUrls: ['./file-item.component.scss']
})
export class FileItemComponent implements OnInit {
  @Input() dataRecord:any;
  constructor() { }

  ngOnInit(): void {
   console.log("I'm awake") 
  }

}
