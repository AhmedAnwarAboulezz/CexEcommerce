import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from 'src/app/core/services/http/http.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { Table } from 'src/app/core/interfaces/table';

@Component({
  selector: 'app-details-group',
  templateUrl: './details-group.component.html',
  styleUrls: ['./details-group.component.scss']
})
export class DetailsGroupComponent implements OnInit {
  id: number | undefined;
  columns: Table[] = [];
  rows: any[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  lang = '';
  informationUser: any;
  selectedUser: any;
  selected = [];
  selectedRows: any[] = [];


  constructor( private route: ActivatedRoute,
    private httpService: HttpService,
    private translateService: TranslationService,
    ) { }

  ngOnInit(): void {
    this.id = +(this.route.snapshot.paramMap.get('id') as string);
    this.translateService.currentLanguage$.subscribe((lang) => {
      this.lang = lang;
      this.getUserInformation();
      this.generateColumns();
      this.getGroup();
    });

  }

  getUserInformation() {
    this.httpService.get(`Groups/Get/${this.id}`).subscribe(data => {
      this.informationUser = data ? data : [];
      console.log(this.informationUser);
  });
}

generateColumns() {
  this.columns = [
    {
      title: '',
      rowPropertyName: 'select',
      className: 'meduim',
      type: 'checkbox',
    },
    {
      title: 'Customer ID',
      rowPropertyName: 'id',
      className: 'meduim',
      type: 'data',
    },
    {
      title: 'Card Number',
      rowPropertyName: 'cardNumber',
      className: 'meduim',
      type: 'data',
    },
    {
      title: 'Customer Name',
      rowPropertyName: 'name',
      className: 'meduim',
      type: 'data',
    },
    {
      title: 'Mobile',
      rowPropertyName: 'phone',
      className: 'meduim',
      type: 'data',
    }
  ];
}

getSelectedRows(event: any[]) {
  this.selectedRows = event;
}

getGroup() {
  const body = {
    pageNumber: this.pageNumber,
    pageSize: this.pageSize,
    filter: {
      id: this.id
    }
  };
  this.httpService.post('Groups/GetPagedCustomersByGroupId', body).subscribe((data) => {
    this.rows = data.data;
  });
}

deleteSelected() {
  const array = this.selectedRows.map((row) => ({
    groupId: this.id,
    customerId: row.id,
  }));
  this.httpService
    .post('Groups/DeleteCustomerFromGroup', array)
    .subscribe(() => {
      this.getGroup();
    });
}

  doAction(event: any) {
    switch (event.actionType) {
      case 'delete':

        break;
      case 'details':
        break;
        case 'add':

        break;
      default:
        break;
    }
}
}
