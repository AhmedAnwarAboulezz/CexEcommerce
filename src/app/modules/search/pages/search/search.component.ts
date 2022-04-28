import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Table } from 'src/app/core/interfaces/table';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { HttpService } from 'src/app/core/services/http/http.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { LockupService } from 'src/app/core/services/lockup/lockup.service';
import { DatePipe, formatDate } from '@angular/common';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  rows: any[] = [];
  columns: Table[] = [];
  transactionsColumns: Table[] = [];
  searchForm: FormGroup | any;
  selectedUser: any;
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  langSubscription!: Subscription;
  lang!: string;
  mainForm!: FormGroup | any;
  mainFormMob!: FormGroup | any;
  mainFormStatus!: FormGroup | any;
  reason: any[] = [];
  today = new Date().toDateString();
  @ViewChild('userDetails', { static: true }) userDetails: any;
  @ViewChild('points', { static: true }) points: any;
  @ViewChild('mobile', { static: true }) mobile: any;
  @ViewChild('merge', { static: true }) merge: any;
  @ViewChild('changeStatus', { static: true }) changeStatus: any;

  
  constructor(private fb: FormBuilder, private http: HttpService, private modal: MatDialog, private alertService: AlertService, private translateService: TranslationService, private lookup: LockupService) { }

  ngOnInit(): void {
    this.initForm();
    this.generateColumns();
    this.generateTransactionsColumns();
    this.langSubscription = this.translateService.currentLanguage$.subscribe(lang => {
      this.lang = lang;
    });
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    document.querySelector('.mat-form-field-outline-thick .mat-form-field-outline-start')?.classList.add('w-auto');
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.langSubscription.unsubscribe();
  }

  initForm() {
    this.searchForm = this.fb.group({
      searchCriteria: ['', Validators.required]
    });
  }

  search() {
    const body = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      filter: {
        id: null,
        cardId: null,
        phone: null,
        searchCriteria: this.searchForm.get('searchCriteria').value,
        nameEn: null,
        nameAr: null,
        name: null
      },
      orderByValue: [
        {
          colId: 'CreatedDate',
          sort: 'desc'
        }
      ]
    };

    this.http.post('Customers/GetPaged', body).subscribe((data) => {
      this.totalCount = data.totalCount;
      this.rows = data.data;
    });
  }

  generateColumns() {
    this.columns = [
      {
        title: 'HOME.SEARCH.NAME',
        rowPropertyName: 'name',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.SEARCH.MOBILE',
        rowPropertyName: 'phone',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.SEARCH.NATID',
        rowPropertyName: 'nationalId',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.SEARCH.ACTION',
        rowPropertyName: 'actions',
        className: 'meduim',
        type: 'action',
        actionType: 'icon',
        actionIconName: ['details', 'points', 'mobile', 'merge','edit']
      }
    ];
  }

  generateTransactionsColumns() {
    this.transactionsColumns = [
      {
        title: 'HOME.DATE',
        rowPropertyName: 'date',
        className: 'meduim',
        type: 'date'
      },
      {
        title: 'HOME.STORE',
        rowPropertyName: 'store',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.TRANSTYPE',
        rowPropertyName: 'transactionType',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.AMOUNT',
        rowPropertyName: 'amount',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.POINTS',
        rowPropertyName: 'points',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.NOTES',
        rowPropertyName: 'notes',
        className: 'meduim',
        type: 'data'
      }
    ];
  }

  doAction(event: any) {
    debugger;
    this.http.get(`Cards/GetByCustomerId/${event.row.id}`).subscribe(cardDetails => {
      event.row.cardDetails = cardDetails;

      let body = {
        id: null,
        cardNumber: cardDetails.id,
        customerMobile: null,
        nameEn: null,
        nameAr: null,
        name: null,
        transactionTypes: null,
      };

      this.http.post('Transactions/GetTransactionsForSearch', body).subscribe(data => {
        let transactions: any[] = []
        data.map((each: any, index: number) => {
          transactions.push({
            id: each.id,
            date: each.transactionDate,
            store: this.lang === 'en' ? each.store?.nameEn : each.store?.nameAr,
            transactionType: this.lang === 'en' ? each.transactionType?.nameEn : each.transactionType?.nameAr,
            amount: each.transactionAmountWithVat,
            points: each.points,
            notes: each.notes,
          });
        });

        event.row.transactions = transactions;
        this.selectedUser = event.row;
        this.lookup.getAllReasons().subscribe(data => { this.reason = data })

        // this.modal.open(this.userDetails, {
        //   panelClass: 'default',
        //   width: '1200px',
        // });
        switch (event.actionType) {
          case 'details':
            this.modal.open(this.userDetails, {
              panelClass: 'default',
              width: '1200px',
            });
            break;
          case 'points':
            this.modal.open(this.points, {
              panelClass: 'medium'
            });
            break;
          case 'mobile':
            this.modal.open(this.mobile, {
              panelClass: 'medium'
            });
            break;
          case 'merge':
            this.modal.open(this.merge, {
              panelClass: 'medium'
            });
            break;
          case 'edit':
              this.modal.open(this.changeStatus, {
                panelClass: 'medium'
              });
            break;
          default:
            break;
        }
        this.mainForm = this.fb.group({
          text: [''],
          reason: [null],
          expireDate: [''],

        });
        this.mainFormMob = this.fb.group({
          newNumber: ['', Validators.required]
          // Validators.pattern("^(966)([0-9]{9})$"),  Validators.minLength(12), Validators.maxLength(12) ,Validators.required    ]],
          //expireDate: ['']
        });
        this.mainFormStatus = this.fb.group({
          statusId: [event.row.statusId == 1 ? true : false],
          currentStatusId: [event.row.statusId == 1 ? true : false],
        });
      });
    });
  }

  copy(text: any) {
    let listener = (e: ClipboardEvent) => {
      let clipboard: DataTransfer | any = e.clipboardData;
      clipboard.setData("text", text);
      e.preventDefault();
    };

    document.addEventListener("copy", listener, false)
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);

    this.alertService.success('Copied Successfully!')
  }
  close() {
    this.modal.closeAll();
  }
  add() {
    const body = {
      customerId: this.selectedUser.id,
      points: this.mainForm.get('text')?.value,
      note: this.mainForm.get('reason')?.value.toString(),
      expireDate: this.mainForm.get('expireDate')?.value
    };
    this.http.post('Transactions/AddCompensation', body).subscribe((res) => {
      if (res) {
        this.modal.closeAll();
        this.search()
        this.alertService.success('Added Points Successfully!')
      }
    });
  }
  addMobile() {
    const body = {
      oldPhone: this.selectedUser?.phone.toString(),
      newPhone: this.mainFormMob.get('newNumber')?.value.toString(),
    };

    if (this.mainFormMob.valid) {
      this.http.post('Customers/ModifyCustomerNewPhone', body).subscribe((res) => {
        if (res) {
          this.modal.closeAll();
          this.search()
          this.alertService.success('Added New Mobile Successfully!')
        }
      });

    }

  }
  mergeMobile() {

    const body = {
      customerId: this.selectedUser?.id,
      anotherAccountPhone: this.mainFormMob.get('newNumber')?.value.toString(),
      expireDate: this.mainFormMob.get('expireDate')?.value
    };

    if (this.mainFormMob.valid) {
      this.http.post('Customers/MergeCustomerAccount', body).subscribe((res) => {
        if (res) {
          this.modal.closeAll();
          this.search()
          this.alertService.success('New Mobile Merged Successfully!')
        }
      });

    }

  }
  changeCurrentStatus() {
    if (this.mainFormStatus.valid) {
      this.http.get(`Customers/UpdateCustomerStatus/${this.selectedUser?.id}`).subscribe((res) => {
        if (res) {
          this.modal.closeAll();
          this.search();
          this.alertService.success(this.lang == "en" ? 'Status Changed Successfully!' : 'تم تغيير الحالة بنجاح')
        }
      });

    }

  }
}
