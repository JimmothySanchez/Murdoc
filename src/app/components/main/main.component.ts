import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../../core/services/electron/electron.service';
import { FileSearchComponent } from '../file-search/file-search.component';
import { PreviewComponent } from '../preview/preview.component';
import { FileItemComponent } from '../file-item/file-item.component';
import { i_Configuration, i_File, i_MainSchema } from '../../../../schemas';
import { SearchPipe } from '../../pipes/search.pipe';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditConfigComponent } from '../edit-config/edit-config.component';
import { PageEvent } from '@angular/material/paginator';



@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  _datastore: any;
  data: i_MainSchema = { Files: [], TagOptions: [] };
  //data:any;
  // MatPaginator Inputs
  length = 100;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  fileFilter = { Name: "", Tags: [], Page: { pageSize: this.pageSize, pageIndex: 0, length: 100 } };
  selectedFile: i_File;
  pageEvent: PageEvent;
  dialogRef = null;


  constructor(private router: Router, private electronService: ElectronService, public dialog: MatDialog, private _cdr: ChangeDetectorRef) {
    if (this.electronService.isElectron) {
      this.electronService.ipcRenderer.on('update-data', (event, arg) => {
        console.log("Updating Data");
        this.electronService.ipcRenderer.send('query-data',this.fileFilter);
        this.electronService.ipcRenderer.send('query-tags');
       // console.log(arg[0]);
        //console.log(arg[1]);
       // this.data.Files = arg[0];
        //this.data.TagOptions= arg[1];
        //this._cdr.detectChanges();
      });
      this.electronService.ipcRenderer.on('log', (event, arg) => {
        console.log(arg);
      });
      this.electronService.ipcRenderer.on('tags-return', (event, arg) => {
        this.data.TagOptions = arg;
      });
      this.electronService.ipcRenderer.on('query-return', (event, arg) => {
        this.data.Files = arg;
        this._cdr.detectChanges();
      });
      this.electronService.ipcRenderer.send('init-ipc', 'ping');
      //this.electronService.ipcRenderer.send('query-data',this.fileFilter);
    }
  }

  updateSearch(newSearch: string): void {
    this.fileFilter.Name = newSearch;
    this.electronService.ipcRenderer.send('query-data',this.fileFilter);
  }



  UpdateSelected(newSelected: i_File): void {
    this.selectedFile = newSelected;
    console.log("selected %s", this.selectedFile.Name);
    this._cdr.detectChanges();
  }

  UpdateSearchTags(tags: string[]): void {
    this.fileFilter.Tags = tags;
    this.electronService.ipcRenderer.send('query-data',this.fileFilter);
  }

  ngOnInit(): void {
    
  }

  onPage(page: PageEvent): void {
    console.log(page);
    this.fileFilter.Page = page;
    this.electronService.ipcRenderer.send('query-data',this.fileFilter);
  }


  OpenSettings(): void {
    if (this.dialogRef === null) {
      this.electronService.ipcRenderer.send('fe-request-config');
      this.electronService.ipcRenderer.on('be-send-config', (event, arg: i_Configuration) => {
        if (this.dialogRef === null) {
          this.dialogRef = this.dialog.open(EditConfigComponent, {
            width: '500px',
            data: arg
          });
        }

        this.dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
          this.dialogRef = null;
          //this.animal = result;
        });
      });
    }

  }




}
