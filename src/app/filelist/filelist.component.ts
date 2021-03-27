import { Component, OnInit } from '@angular/core';
import { FileitemComponent} from '../fileitem/fileitem.component'

@Component({
  selector: 'app-filelist',
  templateUrl: './filelist.component.html',
  styleUrls: ['./filelist.component.scss']
})
export class FilelistComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
