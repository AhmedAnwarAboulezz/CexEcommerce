import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from 'src/app/core/services/http/http.service';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LockupService } from 'src/app/core/services/lockup/lockup.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import * as moment from 'moment';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss'],
})
export class FamilyComponent implements OnInit {
  userData: any;
  userId = '';
  userTypeId = '';
  lang = '';
  today = moment().format();
  userInformation: any;
  showPassword = false;
  cardDetails: any;
  addForm!: FormGroup;
  maritalStatus: any[] = [];
  customerRelations: any[] = [];
  relationShipTypes: any[] = [];
  preferredLanguages: any[] = [];
  nationalities: any;
  cities: any[] = [];
  districts: any[] = [];
  mainForm: FormGroup = new FormGroup({});
  familyRelations: any[] = [];
  @ViewChild('completeModal', { static: true }) completeModal: any;
  @ViewChild('familyModal', { static: true }) familyModal: any;
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
    this.userTypeId = this.httpService.getUserToken().UserTypeId;
    this.translateService.currentLanguage$.subscribe((lang) => {
      this.lang = lang;
    });
    this.getCustomerRelations();
    this.getUserData();
    this.getCustomerDetails();
  }

  getCustomerRelations() {
    this.httpService.get('Customers/GetCustomerRelations').subscribe((data) => {
      this.customerRelations = data ? data : [];
    });
  }

  getCustomerDetails() {
    let body = {
      id: null,
      cardNumber: null,
      phone: null,
    };

    this.httpService
      .post('Customers/GetCustomerDetails', body)
      .subscribe((data) => {
        //console.log(data);
        this.familyRelations = data.family ? data.family : [];
        window.setTimeout(() => {
          data.family.map((familyMember: any, index: number) => {
            JsBarcode('#family-' + index, familyMember.card?.id, {
              font: 'monospace',
              fontOptions: 'bold',
              fontSize: 18,
              textMargin: 3,
              height: 60,
              width: 2,
            });
          });
        }, 0);
      });
  }

  initlizeForm(modalTemplate?: any, config?: any) {
    this.httpService
      .get(`Customers/Get/${this.userTypeId}`)
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
    body.phone = body.phone.toString();
    body.password = body.password.toString();
    body.confirmPassword = body.confirmPassword.toString();
    this.httpService.post('Customers/Add', body).subscribe(() => {
      this.close();
      this.getCustomerRelations();
    });
  }

  doAction(event: any) {
    console.log(event);
  }

  getUserData() {
    this.authService.userDetails$.subscribe((userData) => {
      console.log(userData);
      if (userData) {
        this.userData = userData;
        this.cardDetails = userData.cardDetails;

        JsBarcode('#barcode1', this.cardDetails.id, {
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
            .subscribe((nationalities) => (this.nationalities = nationalities));

          // this.modal.open(this.completeModal, {
          //   disableClose: true,
          //   autoFocus: false,
          //   panelClass: 'small',
          // });
        }
      }
    });
  }

  initForm() {
    this.mainForm = this.fb.group({
      userId: [this.userId],
      userTypeId: [this.userTypeId],
      email: ['', [Validators.required, Validators.email]],
      nickName: ['', [Validators.required]],
      nationalId: ['', [Validators.required]],
      languageId: [null, [Validators.required]],
      maritalStatus: [null, [Validators.required]],
      cityId: [null, [Validators.required]],
      nationality: [null, [Validators.required]],
      districtId: [null, [Validators.required]],
    });

    this.lockupService.getCitiesByCountryId('KSA').subscribe((cities) => {
      this.cities = cities;
    });

    this.mainForm.get('cityId')?.valueChanges.subscribe((cityId) => {
      this.httpService
        .get(`Lookups/GetAllDistrictsByCityId/${cityId}`)
        .subscribe((districts) => (this.districts = districts));
    });
  }

  getUserInformation(modalTemplate?: any, config?: any) {
    if (this.userInformation) {
      this.mainForm.patchValue(this.userInformation);
      modalTemplate
        ? this.modal
            .open(modalTemplate, config)
            .afterClosed()
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
        .get(`Customers/Get/${this.userTypeId}`)
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

          this.mainForm.get('cityId')?.valueChanges.subscribe((cityId) => {
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
                .subscribe(() => this.mainForm.reset())
            : '';
        });
    }
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
      default:
        config = {
          autoFocus: false,
        };

        this.modal.open(modalTemplate, config);
        break;
    }
  }

  close() {
    this.modal.closeAll();
  }

  getGenderValue(event: any) {
    const value = event.value;
    this.addForm.get('gender')?.setValue(value);
  }
}
