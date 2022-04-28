import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { Table } from 'src/app/core/interfaces/table';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  imageURL = '';
  displayedColumns: string[] = [];
  row: any;

  selection = new SelectionModel<any>(true, []);

  // table columns array
  @Input() columns: Table[] = [];

  // tabel rows array witch returns from the API
  @Input() rows: any[] = [];

  // if the table must have index
  @Input() withIndex: boolean = false;

  // if the table have custom class
  @Input() isCustomClass: boolean = false;

  // if the table have checkbox
  @Input() withCheckbox: boolean = false;


  // EventEmitter have action's data
  @Output() action = new EventEmitter();

  // EventEmitter have selected checkbox
  @Output() selectedRows = new EventEmitter();
  
  constructor(private modal: MatDialog) { }

  ngOnInit(): void { 
    this.columns = this.columns.filter(column => column.rowPropertyName !== 'index' && column.rowPropertyName !== 'checkbox')
    if (this.withIndex) {
      this.rows.map((row, index) => {
        row['index'] = index + 1;
      });

      if (!this.columns.find(column => column.rowPropertyName === 'index')) {
        this.columns.unshift({
          title: '#',
          rowPropertyName: 'index',
          type: 'data',
        });
      }
    } 
    else if (this.withCheckbox) {
      if (!this.columns.find(column => column.rowPropertyName === 'checkbox')) {
        this.columns.unshift({
          title: '',
          rowPropertyName: 'checkbox',
          type: 'checkbox',
        });
      }
    }

    this.displayedColumns = [];
    this.columns.map(column => {
      this.displayedColumns.push(column.rowPropertyName);
    });
  }

  ngAfterViewChecked() {
    
  }

  doAction(row: any, actionType: string) {
    const action = {
      actionType,
      row
    };

    this.action.emit(action);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.rows.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.rows.forEach(row => this.selection.select(row));

    this.selectedRows.emit(this.selection.selected);
  }

  slice(string: string) {
    if (string.length > 100) {
      return string.slice(0, 100);
    }

    return string;
  }

  getBackground(row: any): string{
    if (row.hasOwnProperty("benficairyMobile") && row.benficairyMobile !== null) {
      return '#9bff9b';
    }
    return '#fff';
  }

  isCheckedDisabled(row: any): boolean{
    return row.hasOwnProperty("benficairyMobile") && row.benficairyMobile !== null;
  }
  
}
