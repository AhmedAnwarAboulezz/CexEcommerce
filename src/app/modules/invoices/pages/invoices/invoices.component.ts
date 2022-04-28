import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Table } from 'src/app/core/interfaces/table';
import { HttpService } from 'src/app/core/services/http/http.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';

enum QuestionTypes {
  rating = 1,
  boolean,
  multiple,
  question
};

enum Rating {
  terrible = 1,
  bad,
  okay,
  good,
  happy
};

enum Boolean {
  like = 1,
  dislike
};
@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  
  QuestionTypes = QuestionTypes;
  Rating = Rating;
  Boolean = Boolean;
  customerId ='';
  mainForm!: FormGroup | any;
  survey: any;
  columns: Table[] = [];
  rows: any[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  lang = '';
  selectedUser: any;
  rowID: any;
  title:any = 'Al Sadhan';
  elementType:any = 'url';
  value:any=[];
  @ViewChild('surveyModal', { static: true }) surveyModal: any;
  @ViewChild('viewModal', { static: true }) viewModal: any;

  constructor(private httpService: HttpService, private translateService: TranslationService, private fb: FormBuilder, private modal: MatDialog) { }

  ngOnInit(): void {
    this.customerId = this.httpService.getUserToken().UserTypeId;
    this.generateColumns();
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang; this.getTransactions(); });
  }

  generateColumns() {
    this.columns = [
      {
        title: 'Invoices.Date',
        rowPropertyName: 'date',
        className: 'meduim',
        type: 'date'
      },
      {
        title: 'Invoices.Store',
        rowPropertyName: 'store',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.TYPE',
        rowPropertyName: 'notes',
        className: 'meduim',
        type: 'data',
      },
      {
        title: 'Invoices.Amount',
        rowPropertyName: 'amount',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'HOME.POINTS',
        rowPropertyName: 'points',
        className: 'meduim',
        type: 'data',
      },
      {
        title: 'HOME.ACTIONS',
        rowPropertyName: 'actions',
        className: 'meduim',
        type: 'action',
        actionType: 'icon',
        actionIconName: ['rating', 'complain', 'view']
      }
    ];
  }

  getTransactions() {
    let body = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      filter: {
        id: null,
        cardNumber: null,
        customerMobile: null,
        nameEn: null,
        nameAr: null,
        name: null,
        //transactionType : 4
        transactionTypes : [ 4 , 11 ]
      },
      orderByValue: [
        {
          colId: 'CreatedDate',
          sort: 'desc'
        }
      ]
    };

    this.httpService.post('Transactions/GetPaged', body).subscribe(data => {
      let transactions: any[] = [];

      data.data.map((each: any, index: number) => {
        transactions.push({
          id: each.id,
          no: index + 1,
          date: each.transactionDate,
          store:  this.lang === 'en' ? each.store.nameEn : each.store.nameAr,
          amount: each.transactionAmount,
          points: each.points,
          notes: this.lang === 'en' ? each.transactionType?.nameEn : each.transactionType?.nameAr
        });
      });
      
      this.totalCount = data.totalCount;
      this.rows = transactions;
    });
  }

  doAction(event: any) {
    switch (event.actionType) {
      case 'rating':
        this.getSurveyQuestions(2, event.row.id);
        break;
      case 'complain':
        this.getSurveyQuestions(3, event.row.id);
        break;
        case 'view':
        this.modal.open(this.viewModal, {
          panelClass: 'medium'});
        break;
      default:
        break;
    }
    this.httpService.get(`Transactions/GetInvoice/${event.row.id}`).subscribe(rowDetails => {
      event.row.rowDetails = rowDetails;
      this.selectedUser = rowDetails;
      this.rowID =event.row.id;
      this.value= {
        "Saller's name": this.lang === 'en' ? this.selectedUser.storeNameEn : this.selectedUser.storeNameAr ,
        "Saller's TRN": '30054265678547854',
        "Date": this.selectedUser.transactionDate,
        "Total": this.selectedUser.total,
        "Vat": this.selectedUser.vat
      };
      this.value = JSON.stringify(this.value);
      });
  }

  getSurveyQuestions(surveyType: any, transactionId = null) {
    this.httpService.get(`Surveys/GetByType/${surveyType}/${transactionId ? transactionId : ''}`).subscribe(survey => {
      this.survey = survey;
      let questionsForm: FormGroup[] = [];
      
      this.survey.questions.map((question: any) => {
        questionsForm.push(this.fb.group({
          questionId: question.id,
          answerId: [null, question.questionTypeId !== QuestionTypes.question ? Validators.required : null],
          answerText: [null, question.questionTypeId === QuestionTypes.question ? Validators.required : null]
        }));
      });

      const surveyForm = {
        surveyId: survey.id,
        answers: this.fb.array(questionsForm),
        transactionId: [transactionId],
        notes: ['']
      };

      this.mainForm = this.fb.group(surveyForm);
      this.openDialog(this.surveyModal);
    });
  }
  
  openDialog(modalTemplate: any) {
    const config = {
      autoFocus: false,
      panelClass: 'medium'
    };
    
    this.modal.open(modalTemplate, config);
  }

  setRate(questionIndex: number, rateNumber: number) {
    this.mainForm.get('answers').controls[questionIndex].get('answerId').setValue(rateNumber);
  }

  rate() {
    console.log(this.mainForm?.value);
    this.httpService.post('SurveyResults/UpdateSurveyResult', this.mainForm?.value).subscribe(() => this.modal.closeAll());
  }
}
