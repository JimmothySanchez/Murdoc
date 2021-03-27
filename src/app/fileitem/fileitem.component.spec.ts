import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileitemComponent } from './fileitem.component';

describe('FileitemComponent', () => {
  let component: FileitemComponent;
  let fixture: ComponentFixture<FileitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileitemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
