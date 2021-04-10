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
  data: i_MainSchema = { Files: [], TagOptions: [] };
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
        this.data = arg;
        this._cdr.detectChanges();
      });
      this.electronService.ipcRenderer.send('init-ipc', 'ping');
    }
  }

  updateSearch(newSearch: string): void {
    this.fileFilter.Name = newSearch;
    this._cdr.detectChanges();
  }

  UpdateSelected(newSelected: i_File): void {
    this.selectedFile = newSelected;
    console.log("selected %s", this.selectedFile.Name);
    this._cdr.detectChanges();
  }

  UpdateSearchTags(tags: string[]): void {
    this.fileFilter.Tags = tags;
    this._cdr.detectChanges();
  }

  ngOnInit(): void {

  }

  onPage(page: PageEvent): void {
    console.log(page);
    this.fileFilter.Page = page;
    this._cdr.detectChanges();
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
