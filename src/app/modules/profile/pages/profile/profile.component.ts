import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { LockupService } from 'src/app/core/services/lockup/lockup.service';

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
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  QuestionTypes = QuestionTypes;
  Rating = Rating;
  Boolean = Boolean;
  userId = '';
  customerId = '';
  lang = '';
  userInformation: any;
  cardDetails: any;
  mainForm!: FormGroup | any;
  isMorning = moment().format('a') === 'am';
  today = moment().format();
  lastTransaction: any;
  survey: any;

  maritalStatus: any[] = [];
  preferredLanguages = [];
  nationalities = [];
  cities: any[] = [];
  districts: any[] = [];

  @ViewChild('surveyModal', { static: true }) surveyModal: any;

  constructor(private httpService: HttpService, private translateService: TranslationService, private fb: FormBuilder, private modal: MatDialog,
              private lockupService: LockupService) { }

  ngOnInit(): void {
    this.userId = this.httpService.getUserToken().UserId;
    this.customerId = this.httpService.getUserToken().UserTypeId;
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang; });
    this.getUserInformation();
    this.getTransactions();
  }

  getUserInformation(modalTemplate?: any, config?: any) {
    if (this.userInformation) {
      this.mainForm.patchValue(this.userInformation);
      modalTemplate ? this.modal.open(modalTemplate, config).afterClosed().subscribe(() => this.mainForm.reset()) : '';
    } else {
      this.maritalStatus = this.lockupService.getMaritalStatuses();
      this.lockupService.getPreferredLanguages().subscribe(preferredLanguages => { this.preferredLanguages = preferredLanguages });
      this.lockupService.getCountries().subscribe(nationalities => this.nationalities = nationalities);

      this.httpService.get(`Cards/GetByCustomerId/${this.customerId}`).subscribe(cardDetails => {
        this.cardDetails = cardDetails;
        //console.log(cardDetails)
      });

      this.httpService.get(`Customers/Get/${this.customerId}`).subscribe(userInformation => {
        this.userInformation = userInformation;
        //console.log(userInformation)
        this.mainForm = this.fb.group({
          name: ['', [Validators.required]],
          nickName: ['', [Validators.required]],
          phone: ['', [Validators.required]],
          email: ['', [Validators.required, Validators.email]],
          nationalId: ['', [Validators.required]],
          dateOfBirth: ['', [Validators.required]],
          maritalStatus: [null, [Validators.required]],
          gender: ['', [Validators.required]],
          countryId: [null],
          cityId: [null],
          languageId: [null],
          districtId: [null]
        });

        this.lockupService.getCitiesByCountryId('KSA').subscribe(cities => { this.cities = cities });

        this.mainForm.get('cityId')?.valueChanges.subscribe((cityId: any) => {
          if (cityId)
          this.httpService.get(`Lookups/GetAllDistrictsByCityId/${cityId}`).subscribe(districts => this.districts = districts);
        });

        this.mainForm.patchValue(userInformation);
        modalTemplate ? this.modal.open(modalTemplate, config).afterClosed().subscribe(() => this.mainForm.reset()) : '';
      });
    }
  }

  getTransactions() {
    let body = {
      pageNumber: 1,
      pageSize: 1,
      filter: {
        id: null,
        cardNumber: null,
        customerMobile: null,
        nameEn: null,
        nameAr: null,
        name: null,
        transactionType: 4,

      },
      orderByValue: [
        {
          colId: 'CreatedDate',
          sort: 'desc'
        }
      ]
    };

    this.httpService.post('Transactions/Getpaged',body).subscribe(data => {
      let lastTransaction;

      data.data.map((each: any, index: number) => {
        if (index === 0) {
          lastTransaction = {
            id: each.id,
            date: each.transactionDate,
            store:  this.lang === 'en' ? each.store?.nameEn : each.store?.nameAr,
            amount: each.transactionAmount          };
        }
      });

      this.lastTransaction = lastTransaction;
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

  openDialog(modalTemplate: any, isUserInfo = false) {
    const config = {
      autoFocus: false,
      panelClass: 'medium'
    };

    isUserInfo ? this.getUserInformation(modalTemplate, config) : this.modal.open(modalTemplate, config);
  }

  setRate(questionIndex: number, rateNumber: number) {
    this.mainForm.get('answers').controls[questionIndex].get('answerId').setValue(rateNumber);
  }

  rate() {
    console.log(this.mainForm?.value);
    this.httpService.post('SurveyResults/UpdateSurveyResult', this.mainForm?.value).subscribe(() => this.modal.closeAll());
  }

  updateUserInformation() {
    const body = {
      id: this.userInformation.id,
      name: this.mainForm.get('name')?.value,
      nickName: this.mainForm.get('nickName')?.value,
      nationalId: this.mainForm.get('nationalId')?.value.toString(),
      phone: this.mainForm.get('phone')?.value.toString(),
      email: this.mainForm.get('email')?.value,
      gender: this.mainForm.get('gender')?.value,
      dateOfBirth: this.mainForm.get('dateOfBirth')?.value,
      languageId: this.mainForm.get('languageId')?.value,
      maritalStatus: this.mainForm.get('maritalStatus')?.value,
      nationality: this.mainForm.get('countryId')?.value.toString(),
      cityId: this.mainForm.get('cityId')?.value,
      districtId: this.mainForm.get('districtId')?.value
    };

    this.httpService.put('Customers/Update', body).subscribe(() => { this.modal.closeAll(); this.userInformation = undefined; this.getUserInformation() });
  }

  close() {
    this.modal.closeAll();
  }

  getGenderValue(event: any) {
    const value = event.value;
    this.mainForm.get('gender')?.setValue(value);
  }
}
