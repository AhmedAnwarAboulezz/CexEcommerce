import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Table } from 'src/app/core/interfaces/table';
import { HttpService } from 'src/app/core/services/http/http.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { LockupService } from 'src/app/core/services/lockup/lockup.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-complains',
  templateUrl: './complains.component.html',
  styleUrls: ['./complains.component.scss']
})
export class ComplainsComponent implements OnInit {
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
  Email = new FormControl(false);
  SMS = new FormControl(false);


  @ViewChild('informationModal', { static: true }) informationModal: any;

  constructor(private modal: MatDialog, private httpService: HttpService,
    private translateService: TranslationService, private fb: FormBuilder, private lookup: LockupService) { }

  ngOnInit(): void {
    this.generateColumns();
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang; this.getComplains(); });
  }
  generateColumns() {
    this.columns = [
      {
        title: 'Customer Id',
        rowPropertyName: 'customerId',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'Customer Name',
        rowPropertyName: 'customerName',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'Phone',
        rowPropertyName: 'phone',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'Status',
        rowPropertyName: 'status',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'Date',
        rowPropertyName: 'createdDate',
        className: 'meduim',
        type: 'date'
      },
      {
        title: 'HOME.SEARCH.ACTION',
        rowPropertyName: 'actions',
        className: 'meduim',
        type: 'action',
        actionType: 'icon',
        actionIconName: ['details']
      }
    ];
  }

  getComplains() {
    let body = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      filter: {
        surveyType: 3
      },
      orderByValue: [
        {
          colId: 'CreatedDate',
          sort: 'desc'
        }
      ]
    };

    this.httpService.post('SurveyResults/GetPaged', body).subscribe(data => {
      let compalin: any[] = [];


      data.data.map((each: any, index: number) => {
        compalin.push({
          id: each.id,
          customerId: each.customerId,
          customerName: each.customerName,
          phone: each.phone,
          status: this.lang === 'en' ? each.status?.nameEn : each.status?.nameAr,
          createdDate: each.createdDate,

        });
      });

      this.totalCount = data.totalCount;
      this.rows = compalin;
    });
  }

  doAction(event: any) {
    this.httpService.get(`SurveyResults/GetComplainDetails/${event.row.id}`).subscribe(complainDetails => {

      event.row.complainDetails = complainDetails;
      this.selectedUser = complainDetails;
      this.lookup.getComplainStatuses().subscribe(data => { this.questionStatus = data })
      this.modal.open(this.informationModal, {
        panelClass: 'medium',
      });
      this.mainForm = this.fb.group({       
        notes: [''],
        questionStatus: [null,[Validators.required]],
        Email: this.Email,
        SMS: this.SMS,
        
      });
      
    });

  }
  updateComplain() {
    const body = {
      //id: this.selectedUser.id,
      surveyResultId: this.selectedUser.id,
      comment: this.mainForm.get('notes')?.value,
      statusId: this.mainForm.get('questionStatus')?.value,
      notificationOption: (this.mainForm.get('Email')?.value == true && this.mainForm.get('SMS')?.value == true) ? 3 
      : this.mainForm.get('SMS')?.value == true ? 1 : 
      this.mainForm.get('Email')?.value == true ? 2 : 0
        
    };
    if(this.mainForm.valid) {
      this.httpService.post('SurveyResultHistories/Add', body).subscribe(() => { this.modal.closeAll(); this.Email = new FormControl(false);this.SMS = new FormControl(false); this.getComplains() });
    }
  }
  close() {
    this.modal.closeAll();
  }

  // getNotificationOptionValue(event: any) {
  //   const value = event.value;
  //   this.mainForm.get('notificationOption')?.setValue(value);
  // }

}
