import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Table } from 'src/app/core/interfaces/table';
import { HttpService } from 'src/app/core/services/http/http.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { LockupService } from 'src/app/core/services/lockup/lockup.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import * as moment from 'moment';
import { ExcelService } from 'src/app/core/services/excel/excel.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { LoadOptions } from 'src/app/shared/models/LoadOpts';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-addgroup',
  templateUrl: './addgroup.component.html',
  styleUrls: ['./addgroup.component.scss'],
  providers: [ExcelService],
})
export class AddgroupComponent implements OnInit {
  columns: Table[] = [];
  rows: any[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  lang = '';
  selectedUser: any;
  panelOpenState = true;
  mainForm!: FormGroup | any;
  AllSelectedRows: any[] = [];
  selectedRows: any[] = [];
  questionStatus: any[] = [];
  notification: any[] = [];
  districts: any[] = [];
  products: any[] = [];
  stores: any[] = [];
  maxDate = moment().subtract(10, 'years').format();
  today = moment().format();
  selected = [];
  id: number | undefined;
  selectedRow: any;
  scrollSize = 10;
  scrollPageNumber = 1;
  getPaginationOptions: LoadOptions = {
    pageSize: this.scrollSize,
    pageNumber: this.scrollPageNumber,
    searchCriteria: '',
    filter: {
      searchCriteria: '',
    },
  };
  productInputSearch$ = new Subject<string>();
  @Input() multiple = true;

  constructor(
    private modal: MatDialog,
    private httpService: HttpService,
    private translateService: TranslationService,
    private fb: FormBuilder,
    private lookup: LockupService,
    private route: ActivatedRoute,
    private router: Router,
    private excelService: ExcelService
  ) { }

  ngOnInit(): void {
    this.id = +(this.route.snapshot.paramMap.get('id') as string);
    this.generateColumns();
    this.translateService.currentLanguage$.subscribe((lang) => {
      this.lang = lang;
    });


    this.initForm();
    this.searchProductsOnType();
    this.getPagedProducts();
    this.getLoockups();

  }

  getLoockups() {
    //this.getAllProducts();

    this.lookup.getAllStores().subscribe((data) => {
      this.stores = data;
    });

    this.lookup.getAllDistrics().subscribe((data) => {
      this.districts = data;
    });
  }

  searchProductsOnType(): void {
    this.productInputSearch$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchValue: any) => {
        if (searchValue) {
          this.scrollPageNumber = 1;
          this.getPaginationOptions.pageNumber = this.scrollPageNumber;
          this.getPaginationOptions.filter.searchCriteria = searchValue;
          this.products = [];
          this.getPagedProducts();
        }
      });
  }

  getPagedProducts(): void {
    this.httpService.post('Lookups/GetAllItemsPaged', this.getPaginationOptions)
      .pipe(take(1))
      .subscribe((resp: any) => {
        this.scrollPageNumber += 1;
        this.getPaginationOptions.pageNumber = this.scrollPageNumber;
        this.products = this.products.concat(resp.data);
      });
  }
  // getAllProducts() {
  //   let body = {
  //     pageNumber: this.pageNumber,
  //     pageSize: this.pageSize,
  //   };

  //   this.httpService.post('Lookups/GetAllItemsPaged', body).subscribe((data) => {
  //     let products = data.data.map((product: any) => ({ id: product.id, nameEn: product.descriptionEnglish, nameAr: product.descriptionArabic }));
  //     this.products = products;
  //   });
  // }

  initForm() {
    this.mainForm = this.fb.group({
      gender: [null],
      amountfrom: [null],
      amountto: [null],
      transactionformdate: [null],
      transactionenddate: [null],
      districtId: [null],
      mobile: [null, [Validators.pattern('^(966)[0-9,]{1,}$'), Validators.minLength(12)]],
      cardnumber: [null, [Validators.pattern('^[0-9,]{1,}$'), Validators.minLength(6)]],
      product: [null],
      store: [null]
    });
  }

  search() {
    const body = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      filter: {
        cardIds: this.mainForm.get('cardnumber').value?.length > 0 ? this.mainForm.get('cardnumber').value?.split(',') : this.mainForm.get('cardnumber').value,
        phones: this.mainForm.get('mobile').value?.length > 0 ? this.mainForm.get('mobile').value?.split(',') : this.mainForm.get('mobile').value,
        gender: this.mainForm.get('gender').value,
        transactionAmountFrom: this.mainForm.get('amountfrom').value,
        transactionAmountTo: this.mainForm.get('amountto').value,
        transactionDateFrom: this.mainForm.get('transactionformdate').value,
        transactionDateTo: this.mainForm.get('transactionenddate').value,
        storeIds: this.mainForm.get('store').value,
        districtIds: this.mainForm.get('districtId').value,
        productIds: this.mainForm.get('product').value
      },
      orderByValue: [
        {
          colId: 'CreatedDate',
          sort: 'desc',
        },
      ],
    };

    this.httpService.post('Customers/GetPagedForGroup', body).subscribe((data) => {
      this.totalCount = data.totalCount;
      this.rows = data.data;
      this.getGroup();

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
      },
      {
        title: 'HOME.SEARCH.ACTION',
        rowPropertyName: 'actions',
        className: 'meduim',
        type: 'action',
        actionType: 'icon',
        actionIconName: ['eye', 'add'],
      },
    ];
  }

  getSelectedRows(event: any[]) {
    this.selectedRows = event;
  }

  getGroup() {
    const body = {
      pageNumber: this.pageNumber,
      pageSize: 1000000,
      filter: {
        cardIds: this.mainForm.get('cardnumber').value?.length > 0 ? this.mainForm.get('cardnumber').value?.split(',') : this.mainForm.get('cardnumber').value,
        phones: this.mainForm.get('mobile').value?.length > 0 ? this.mainForm.get('mobile').value?.split(',') : this.mainForm.get('mobile').value,
        gender: this.mainForm.get('gender').value,
        transactionAmountFrom: this.mainForm.get('amountfrom').value,
        transactionAmountTo: this.mainForm.get('amountto').value,
        transactionDateFrom: this.mainForm.get('transactionformdate').value,
        transactionDateTo: this.mainForm.get('transactionenddate').value,
        storeIds: this.mainForm.get('store').value,
        districtIds: this.mainForm.get('districtId').value,
        productIds: this.mainForm.get('product').value
      },
      orderByValue: [
        {
          colId: 'CreatedDate',
          sort: 'desc',
        },
      ],
    };
    this.httpService.post('Customers/GetPagedForGroup', body).subscribe((data) => {
      this.totalCount = data.totalCount;
      this.AllSelectedRows = data.data;
    });
  }

  // exportAsXLSX():void {
  //   this.excelService.exportAsExcelFile(this.rows,'sample');
  // }
  exportAsXLSX(): void {
    // this.isExported = true;
    const newArray = this.selectedRows.map((row, index) => ({
      '#': index + 1,
      'Customer ID': row.id,
      'Card Number': row.cardNumber,
      'Customer Name': row.name,
      Mobile: row.phone,
    }));

    this.excelService.exportAsExcelFile(newArray, 'GroupReport');
  }

  exportAllAsXLSX(): void {
    const newArray = this.AllSelectedRows.map((row, index) => ({
      '#': index + 1,
      'Customer ID': row.id,
      'Card Number': row.cardNumber,
      'Customer Name': row.name,
      'Mobile': row.phone,
    }));

    this.excelService.exportAsExcelFile(newArray, 'all');
  }


  doAction(event: any): void {
    switch (event.actionType) {
      // case 'delete':
      //   const headers = { 'Authorization': 'Bearer my-token', 'My-Custom-Header': 'foobar' };
      //   this.httpService.delete(`Customers/Delete/${event.row.id}`,{ headers }).subscribe(complainDetails => {
      //     event.row.complainDetails = complainDetails;
      //     this.selectedUser = complainDetails;
      //     this.getGroup();
      //   });
      //   break;
      case 'view':
        break;
      case 'add':
        this.addCustomersToGroup();
        break;
      default:
        break;
    }
  }

  addCustomersToGroup() {
    const body = {
      groupId: this.id,
      customerId: this.selectedRows[0].id,
    };

    this.httpService
      .post('Groups/AddGroupSingleCustomer', body)
      .subscribe(() => {
        // this.router.navigateByUrl('group');
        // this.getGroup();
      });
  }

  addGroup() {
    const array = this.selectedRows.map((row) => ({
      groupId: this.id,
      customerId: row.id,
    }));
    this.httpService
      .post('Groups/AddGroupCustomers', array)
      .subscribe(() => { });
  }

  addGroupAll() {
    const array = this.AllSelectedRows.map((row) => ({
      groupId: this.id,
      customerId: row.id,
    }));
    this.httpService
      .post('Groups/AddGroupCustomers', array)
      .subscribe(() => { });

  }

  getGenderValue(event: any) {
    const value = event.value;
    this.mainForm.get('gender')?.setValue(value);
  }

  setcmomma(event: any) {
    let finalValue = '';
    let value = JSON.parse(JSON.stringify(event.target.value));

    if (value.length === 12) {
      // equal 12
      if (event.which === 8) {
        finalValue = value;
      } else {
        finalValue = value;
      }
    } else if (value.length > 12) {
      // over 12
      let valueSplited = value.split(','); // array of string of every 12 numbers
      let lastNumbers = valueSplited.pop();

      if (lastNumbers.length === 12) { // equal 12
        if (event.which === 8) {
          finalValue = value;
        }
        else {
          finalValue = value += ',';
        }
      } else if (lastNumbers.length < 12 || lastNumbers.length > 12) {
        finalValue = value;
      }
    }
    else {
      finalValue = value; // less than 12
    }

    return (event.target.value = finalValue);
  }

  setcmommaNumber(event: any) {
    let finalValue = '';
    let value = JSON.parse(JSON.stringify(event.target.value));

    if (value.length === 6) {
      // equal 6
      if (event.which === 8) {
        finalValue = value;
      } else {
        finalValue = value += ', ';
      }
    } else if (value.length > 6) {
      // over 6
      let valueSplited = value.split(', '); // array of string of every 6 numbers
      let lastNumbers = valueSplited.pop();

      if (lastNumbers.length === 6) { // equal 6
        if (event.which === 8) {
          finalValue = value;
        }
        else {

          finalValue = value += ', ';
        }
      } else if (lastNumbers.length < 6 || lastNumbers.length > 6) {
        finalValue = value;
      }

    }

    else {
      finalValue = value; // less than 6
    }

    return (event.target.value = finalValue);
  }

}
