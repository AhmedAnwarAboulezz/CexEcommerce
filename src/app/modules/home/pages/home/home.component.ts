import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Table } from 'src/app/core/interfaces/table';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LockupService } from 'src/app/core/services/lockup/lockup.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import * as moment from 'moment';
import * as JsBarcode from 'jsbarcode';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { NgxQrcodeErrorCorrectionLevels, NgxQRCodeModule } from 'ngx-qrcode2';

enum QuestionTypes {
  rating = 1,
  boolean,
  multiple,
  question,
}

enum Rating {
  terrible = 1,
  bad,
  okay,
  good,
  happy,
}

enum Boolean {
  like = 1,
  dislike,
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [NgbCarouselConfig],
})
export class HomeComponent implements OnInit {
  QuestionTypes = QuestionTypes;
  Rating = Rating;
  Boolean = Boolean;
  userData: any;
  userDataSubscription!: Subscription;
  userId = '';
  customerId = '';
  userInformation: any;
  cardDetails: any;
  lang = '';
  langSubscription!: Subscription;
  mainForm!: FormGroup | any;
  formSubscription!: Subscription;
  // mainForm: FormGroup = new FormGroup({});
  today = moment().format();
  maxDate = moment().subtract(10, 'years').format();
  isMorning = moment().format('a') === 'am';
  maritalStatus: any[] = [];
  preferredLanguages: any[] = [];
  nationalities: any;
  cities: any[] = [];
  districts: any[] = [];
  columns: Table[] = [];
  rows: any[] = [];
  customerRelations: any[] = [];
  relationShipTypes: any[] = [];
  images = [1055, 194, 368].map((n) => `https://picsum.photos/id/${n}/900/500`);
  addForm!: FormGroup;
  fullName: any[] = [];
  nationalId: any[] = [];
  email: any[] = [];
  recommendedProducts: any[] = [];
  showPassword = false;
  survey: any;
  selectedUser: any;
  rowID: any;
  title:any = 'Al Sadhan';
  elementType:any = 'url';
  value:any=[];
  @ViewChild('completeModal', { static: true }) completeModal: any;
  @ViewChild('informationModal', { static: true }) informationModal: any;
  @ViewChild('familyModal', { static: true }) familyModal: any;
  @ViewChild('offerModal', { static: true }) offerModal: any;
  @ViewChild('surveyModal', { static: true }) surveyModal: any;
  @ViewChild('viewModal', { static: true }) viewModal: any;
  @Input() searchable = true;
  correctionLevel: any;

  constructor(
    private httpService: HttpService,
    private modal: MatDialog,
    private fb: FormBuilder,
    private translateService: TranslationService,
    private lockupService: LockupService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.httpService.getUserToken().UserId;
    this.customerId = this.httpService.getUserToken().UserTypeId;
    this.langSubscription = this.translateService.currentLanguage$.subscribe(
      (lang) => {
        this.lang = lang;
        this.getTransactions();
      }
    );

    this.getUserData();
    this.generateColumns();
    this.getRecommendedProducts();
    this.getCustomerRelations();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userData = undefined;
    this.cardDetails = undefined;
    this.userDataSubscription?.unsubscribe();
    this.langSubscription?.unsubscribe();
    this.formSubscription?.unsubscribe();
  }

  generateColumns() {
    this.columns = [
      {
        title: 'HOME.DATE',
        rowPropertyName: 'date',
        className: 'meduim',
        type: 'data',
      },
      {
        title: 'HOME.STORE',
        rowPropertyName: 'store',
        className: 'meduim',
        type: 'data',
      },
      {
        title: 'HOME.TYPE',
        rowPropertyName: 'notes',
        className: 'meduim',
        type: 'data',
      },
      {
        title: 'HOME.AMOUNT',
        rowPropertyName: 'amount',
        className: 'meduim',
        type: 'data',
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
        actionIconName: ['rating', 'complain', 'view'],
      },
    ];
  }

  getCustomerRelations() {
    this.httpService.get('Customers/GetCustomerRelations').subscribe((data) => {
      this.customerRelations = data ? data : [];
    });
  }

  getTransactions() {
    let body = {
      pageNumber: 1,
      pageSize: 5,
      filter: {
        id: null,
        cardNumber: null,
        customerMobile: null,
        nameEn: null,
        nameAr: null,
        name: null,
        //transactionType: 4,
        transactionTypes : [ 4 , 11 ]
      },
      orderByValue: [
        {
          colId: 'CreatedDate',
          sort: 'desc',
        },
      ],
    };

    this.httpService.post('Transactions/Getpaged', body).subscribe((data) => {
      let transactions: any[] = [];
      data.data.map((each: any, index: number) => {
        transactions.push({
          id: each.id,
          date: each.transactionDate,
          store: this.lang === 'en' ? each.store?.nameEn : each.store?.nameAr,
          amount: each.transactionAmount,
          points: each.points, 
          notes: this.lang === 'en' ? each.transactionType?.nameEn : each.transactionType?.nameAr
        });
      });

      this.rows = transactions;
    });
  }

  getUserData() {
    this.userDataSubscription = this.authService.userDetails$.subscribe(
      (userData) => {
        if (userData) {
          this.userData = userData;
          this.cardDetails = userData.cardDetails;

          JsBarcode('#barcode1', this.cardDetails?.id, {
            font: 'monospace',
            fontOptions: 'bold',
            fontSize: 18,
            textMargin: 3,
            height: 60,
            width: 2,
          });

          if (!userData.isRegistrationCompleted) {
            this.initForm();
            this.maritalStatus = this.lockupService.getMaritalStatuses();
            this.lockupService
              .getPreferredLanguages()
              .subscribe((preferredLanguages) => {
                this.preferredLanguages = preferredLanguages;
              });
            this.lockupService
              .getCountries()
              .subscribe(
                (nationalities) => (this.nationalities = nationalities)
              );
            this.lockupService
              .getCitiesByCountryId('KSA')
              .subscribe((cities) => {
                this.cities = cities;
              });

            this.modal.open(this.completeModal, {
              disableClose: true,
              autoFocus: false,
              panelClass: 'small',
            });
          }
        }
      }
    );
  }

  initForm() {
    this.mainForm = this.fb.group({
      userId: [this.userId],
      userTypeId: [this.customerId],
      email: ['', [Validators.required, Validators.email]],
      nickName: ['', [Validators.required]],
      nationalId: ['', [Validators.required]],
      languageId: [null, [Validators.required]],
      maritalStatus: [null, [Validators.required]],
      cityId: [null, [Validators.required]],
      nationality: [null, [Validators.required]],
      districtId: [null, [Validators.required]],
    });

    this.formSubscription = this.mainForm
      .get('cityId')
      ?.valueChanges.subscribe((cityId: any) => {
        this.httpService
          .get(`Lookups/GetAllDistrictsByCityId/${cityId}`)
          .subscribe((districts) => (this.districts = districts));
      });
  }

  initlizeForm(modalTemplate?: any, config?: any) {
    this.httpService
      .get(`Customers/Get/${this.customerId}`)
      .subscribe((userInformation) => {
        this.userInformation = userInformation;

        this.lockupService
          .getRelationShipTypes()
          .subscribe((data) => (this.relationShipTypes = data));
        this.maritalStatus = this.lockupService.getMaritalStatuses();

        this.addForm = this.fb.group(
          {
            name: ['', [Validators.required]],
            gender: ['', [Validators.required]],
            phone: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: [
              '',
              [Validators.required, Validators.minLength(8)],
            ],
            maritalStatus: [null, [Validators.required]],
            dateOfBirth: ['', Validators.required],
            cityId: [
              this.userInformation.cityId,
              this.userInformation.cityId ? Validators.required : '',
            ],
            districtId: [
              this.userInformation.districtId,
              this.userInformation.cityId ? Validators.required : '',
            ],
            relationShipId: [null, [Validators.required]],
            parentId: [0],
            languageId: [this.userInformation.languageId],
          },
          {
            validators: this.mustMatch('password', 'confirmPassword'),
          }
        );

        modalTemplate
          ? this.modal
              .open(modalTemplate, config)
              .afterClosed()
              .pipe(first())
              .subscribe(() => this.addForm.reset())
          : '';
      });
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ confirmPassword: true });
      } else {
        matchingControl.setErrors(null);
      }
    };
  }

  addFamily() {
    const body = this.addForm.value;
    body.phone = '966' + body.phone;
    body.password = body.password.toString();
    body.confirmPassword = body.confirmPassword.toString();

    this.httpService.post('Customers/Add', body).subscribe(() => {
      this.close();
      this.getCustomerRelations();
    });
  }

  register() {
    const body = this.mainForm.value;
    body.maritalStatus = body.maritalStatus.toString();
    body.nationalId = body.nationalId.toString();
    body.nationality = body.nationality.toString();
    this.httpService
      .post('Accounts/CompleteRegistration', body)
      .subscribe((data) => {
        this.modal.closeAll();
        this.authService.userDetails.next(null);
        this.getUserData();
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
      this.correctionLevel = NgxQrcodeErrorCorrectionLevels.HIGH;

      this.value= {
        "Saller's name": this.lang === 'en' ? 'AlSADHAN - '+ this.selectedUser.storeNameEn : 'AlSADHAN - '+ this.selectedUser.storeNameEn ,
        "Saller's TRN": '30054265678547854',
        "Date": this.selectedUser.transactionDate,
        "Total": this.selectedUser.total,
        "Vat": this.selectedUser.vat
      };
      this.value = JSON.stringify(this.value);
      });

  }
  getSurveyQuestions(surveyType: any, transactionId = null) {
    this.httpService
      .get(
        `Surveys/GetByType/${surveyType}/${transactionId ? transactionId : ''}`
      )
      .subscribe((survey) => {
        this.survey = survey;
        let questionsForm: FormGroup[] = [];

        this.survey.questions.map((question: any) => {
          questionsForm.push(
            this.fb.group({
              questionId: question.id,
              answerId: [
                null,
                question.questionTypeId !== QuestionTypes.question
                  ? Validators.required
                  : null,
              ],
              answerText: [
                null,
                question.questionTypeId === QuestionTypes.question
                  ? Validators.required
                  : null,
              ],
            })
          );
        });

        const surveyForm = {
          surveyId: survey.id,
          answers: this.fb.array(questionsForm),
          transactionId: [transactionId],
          notes: [''],
        };

        this.mainForm = this.fb.group(surveyForm);
        this.openDialog(this.surveyModal);
      });
  }

  setRate(questionIndex: number, rateNumber: number) {
    this.mainForm
      .get('answers')
      .controls[questionIndex].get('answerId')
      .setValue(rateNumber);
  }

  rate() {
    console.log(this.mainForm?.value);
    this.httpService
      .post('SurveyResults/UpdateSurveyResult', this.mainForm?.value)
      .subscribe(() => this.modal.closeAll());
  }

  getUserInformation(modalTemplate?: any, config?: any) {
    if (this.userInformation) {
      this.mainForm.patchValue(this.userInformation);
      modalTemplate
        ? this.modal
            .open(modalTemplate, config)
            .afterClosed()
            .pipe(first())
            .subscribe(() => this.mainForm.reset())
        : '';
    } else {
      this.maritalStatus = this.lockupService.getMaritalStatuses();
      this.lockupService
        .getPreferredLanguages()
        .subscribe((preferredLanguages) => {
          this.preferredLanguages = preferredLanguages;
        });
      this.lockupService
        .getCountries()
        .subscribe((nationalities) => (this.nationalities = nationalities));

      this.httpService
        .get(`Customers/Get/${this.customerId}`)
        .subscribe((userInformation) => {
          this.userInformation = userInformation;

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
            districtId: [null],
          });

          this.lockupService.getCitiesByCountryId('KSA').subscribe((cities) => {
            this.cities = cities;
          });

          this.mainForm.get('cityId')?.valueChanges.subscribe((cityId: any) => {
            if (cityId)
              this.httpService
                .get(`Lookups/GetAllDistrictsByCityId/${cityId}`)
                .subscribe((districts) => (this.districts = districts));
          });

          this.mainForm.patchValue(userInformation);
          modalTemplate
            ? this.modal
                .open(modalTemplate, config)
                .afterClosed()
                .pipe(first())
                .subscribe(() => this.mainForm.reset())
            : '';
        });
    }
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
      districtId: this.mainForm.get('districtId')?.value,
    };

    this.httpService.put('Customers/Update', body).subscribe(() => {
      this.modal.closeAll();
      this.userInformation = undefined;
    });
  }

  openDialog(modalTemplate: any, type = '') {
    let config: any;
    switch (type) {
      case 'userInformation':
        config = {
          autoFocus: false,
          panelClass: 'medium',
        };

        this.getUserInformation(modalTemplate, config);

        break;
      case 'family':
        config = {
          panelClass: 'small',
          autoFocus: false,
        };

        this.initlizeForm(modalTemplate, config);
        break;
      case 'medium':
        config = {
          autoFocus: false,
          panelClass: 'medium',
        };

        this.modal.open(modalTemplate, config);
        break;
      default:
        config = {
          autoFocus: false,
          panelClass: 'medium',
        };

        this.modal.open(modalTemplate, config);
        break;
    }
  }

  close() {
    this.modal.closeAll();
  }

  getGenderValue(event: any, type = '') {
    const value = event.value;

    if (type === 'main') {
      this.mainForm.get('gender')?.setValue(value);
    } else {
      this.addForm.get('gender')?.setValue(value);
    }
  }

  getRecommendedProducts() {
    this.httpService.get('RecommendedProducts/GetAll').subscribe((products) => {
      this.recommendedProducts = products ? products : [];
    });
  }

}
