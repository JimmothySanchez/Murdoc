import { Component, OnInit, Output, EventEmitter,Input } from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss']
})
export class TagsComponent implements OnInit {
  @Output() UpdateSearchTags=  new EventEmitter<string[]>();
  @Input() TagsList:string[] =["farts"];
  tags = new FormControl();
  constructor() { }

  ngOnInit(): void {
  }

  doSomething(incoming):void{
    this.UpdateSearchTags.emit(incoming.value);
  }

}
