import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Table } from 'src/app/core/interfaces/table';
import { HttpService } from 'src/app/core/services/http/http.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { LockupService } from 'src/app/core/services/lockup/lockup.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent implements OnInit {
  columns: Table[] = [];
  rows: any[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  lang = '';
  selectedUser: any;
  panelOpenState = true;
  mainForm!: FormGroup | any;
  questionStatus: any[] = [];
  notification: any[] = [];
  groupId= 0;
  @ViewChild('informationModal', { static: true }) informationModal: any;

  constructor(private modal: MatDialog, private httpService: HttpService,
    private translateService: TranslationService, private fb: FormBuilder, private lookup: LockupService,private router: Router) { }

  ngOnInit(): void {
    this.generateColumns();
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang; this.getGroup(); });

  }
  generateColumns() {
    this.columns = [
      {
        title: 'Group Name',
        rowPropertyName: 'groupName',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'Group Description',
        rowPropertyName: 'groupdesc',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'Number Of Mebmers',
        rowPropertyName: 'member',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.SEARCH.ACTION',
        rowPropertyName: 'actions',
        className: 'meduim',
        type: 'action',
        actionType: 'icon',
        actionIconName: ['delete','details','add']
      }
    ];
  }

  getGroup() {
    let body = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      orderByValue: [
        {
          colId: 'CreatedDate',
          sort: 'desc'
        }
      ]
    };

    this.httpService.post('Groups/GetPaged', body).subscribe(data => {
      let group: any[] = [];

      data.data.map((each: any, index: number) => {
        group.push({
          id: each.id,
          groupName: each.name,
          groupdesc: each.description,
          member: each.numberOfMembers
        });
      });

      this.totalCount = data.totalCount;
      this.rows = group;
    });
  }
  open() {
    this.modal.open(this.informationModal, {
      panelClass: 'medium',
    });
    this.mainForm = this.fb.group({
      name: [''],
      desc: [''],
    });
  }
  addGroup() {
    const body = {
      id: 0,
      isActive: true,
      name: this.mainForm.get('name')?.value,
      description: this.mainForm.get('desc')?.value,
    };
    this.httpService.post('Groups/Add', body).subscribe(() => {
      this.close();
      this.getGroup();
    });
  }
  doAction(event: any) {
    switch (event.actionType) {
      case 'delete':
        const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };
        this.httpService.delete(`Groups/Delete/${event.row.id}`,{ headers }).subscribe(complainDetails => {
          event.row.complainDetails = complainDetails;
          this.selectedUser = complainDetails;
          this.getGroup();
        });
        break;
      case 'details':
        this.router.navigateByUrl(`group/details/${event.row.id}`);

        break;
        case 'add':
          this.router.navigateByUrl(`group/add/${event.row.id}`);

        break;
      default:
        break;
    }


  }

  close() {
    this.modal.closeAll();
  }
}
