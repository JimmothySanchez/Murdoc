import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-file-search',
  templateUrl: './file-search.component.html',
  styleUrls: ['./file-search.component.scss']
})
export class FileSearchComponent implements OnInit {
  @Output() UpdateSearch = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }

  UpdateText(newText:string):void{
    this.UpdateSearch.emit(newText);
  }
}
