import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { HttpService } from 'src/app/core/services/http/http.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { MatDialog } from '@angular/material/dialog';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { AuthDataHolderService } from './auth-data-holder.service';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { StorageService } from 'src/app/shared/storage/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [NgbCarouselConfig],
})
export class LoginComponent implements OnInit {
  public pageType = '';
  mainForm: FormGroup = new FormGroup({});
  showPassword = false;
  maxDate = moment().subtract(10, 'years').format();
  isForgetPasswordSent = false;
  isVerificationSent = false;
  forgetPasswordType = '';
  pinCode = '';
  token: any;
  userId = '';
  customerId = '';
  lang!: string;

  partners: any = [];

  constructor(
    private fb: FormBuilder,
    private _activatedRoute: ActivatedRoute,
    private router: Router,
    private httpService: HttpService,
    private translateService: TranslationService,
    private modal: MatDialog,
    private auth: AuthDataHolderService,
    private alertService: AlertService,
    private localStorageService: StorageService
  ) {}

  ngOnInit(): void {
    this.translateService.currentLanguage$.subscribe((lang) => {
      this.lang = lang;
    });

    this.pageType = this._activatedRoute.snapshot.data.type;
    this.token = this._activatedRoute.snapshot.queryParamMap.get('token');

    if (this.token) {
      if (this.pageType === 'FORGET_PASSWORD') {
        this.isForgetPasswordSent = true;
        this.mainForm = this.fb.group(
          {
            token: [this.token],
            password: [
              '',
              [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(10),
              ],
            ],
            confirmPassword: [
              '',
              [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(10),
              ],
            ],
          },
          {
            validators: this.mustMatch('password', 'confirmPassword'),
          }
        );
      } else if (this.pageType === 'COMPLETE_PROFILE') {
        this.userId = this.httpService.convertTokenJWT(this.token).UserId;
        this.customerId = this.httpService.convertTokenJWT(
          this.token
        ).UserTypeId;
        localStorage.setItem('token', this.token);
        this.initForm();
      }
    } else {
      this.initForm();
      // this.getData();
    }

    console.log('-----------------------------------------');
    console.log(this.auth.authHolder);
  }

  getData() {
    this.httpService.get('Lookups/GetAllPartners').subscribe((data) => {
      console.log(`🚀 ~ this.httpService.get ~ data`, data);
      this.partners = data;
    });
  }

  initForm() {
    switch (this.pageType) {
      case 'SIGNIN':
        this.mainForm = this.fb.group({
          username: ['', [Validators.required]],
          password: ['', [Validators.required]],
        });

        break;
      case 'SIGNUP_SINGLE':
        this.mainForm = this.fb.group(
          {
            name: ['', [Validators.required]],
            phone: ['', [Validators.required, Validators.minLength(9)]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: [
              '',
              [Validators.required, Validators.minLength(8)],
            ],
            gender: ['', [Validators.required]],
            dateOfBirth: ['', [Validators.required]],
            userType: [2],
          },
          {
            validators: this.mustMatch('password', 'confirmPassword'),
          }
        );
        break;
      case 'SIGNUP':
        this.mainForm = this.fb.group(
          {
            name: ['', [Validators.required]],
            phone: ['', [Validators.required, Validators.minLength(9)]],
            email: ['', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: [
              '',
              [Validators.required, Validators.minLength(8)],
            ],
            gender: ['', [Validators.required]],
            dateOfBirth: ['', [Validators.required]],
            partnerId: [0, [Validators.required]],
            partnerName: ['', [Validators.required]],
            otp: ['', [Validators.required]],
            employeeCode: ['', [Validators.required]],
            userType: [2],
          },
          {
            validators: this.mustMatch('password', 'confirmPassword'),
          }
        );

        const email = this.auth.authHolder?.email;
        const phone = this.auth.authHolder?.phone;
        const employeeCode = this.auth.authHolder?.employeeCode;
        const partnerId = this.auth.authHolder?.partnerId;
        const partnerName =
          this.lang === 'en'
            ? this.auth.authHolder?.nameEn
            : this.auth.authHolder?.nameAr;

        if (email) {
          this.mainForm.get('email')?.setValue(email);
          this.mainForm.get('email')?.disable();
        } else if (phone) {
          this.mainForm.get('phone')?.setValue(phone);
          this.mainForm.get('phone')?.disable();
        }

        this.mainForm.get('employeeCode')?.setValue(employeeCode);
        this.mainForm.get('employeeCode')?.disable();

        this.mainForm.get('partnerName')?.setValue(partnerName);
        this.mainForm.get('partnerName')?.disable();

        this.mainForm.get('partnerId')?.setValue(partnerId);
        this.mainForm.get('parentId')?.disable();

        break;

      case 'SEND_VERIFICATION':
        this.mainForm = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
          phone: [{ value: '', disabled: true }, [Validators.required]],
          type: [1],
        });

        break;
      case 'FORGET_PASSWORD':
        this.mainForm = this.fb.group({
          email: ['', [Validators.required, Validators.email]],
          phone: [{ value: '', disabled: true }, [Validators.required]],
          type: [1],
        });

        break;
      case 'COMPLETE_PROFILE':
        this.mainForm = this.fb.group(
          {
            name: ['', [Validators.required]],
            phone: [
              {
                value: this.httpService.convertTokenJWT(this.token).sub,
                disabled: true,
              },
              [Validators.required],
            ],
            password: [
              '',
              [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(10),
              ],
            ],
            confirmPassword: [
              '',
              [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(10),
              ],
            ],
            gender: ['', [Validators.required]],
            dateOfBirth: ['', [Validators.required]],
            userType: [2],
          },
          {
            validators: this.mustMatch('password', 'confirmPassword'),
          }
        );

        break;
      default:
        break;
    }
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

  getGenderValue(event: any) {
    const value = event.value;
    this.mainForm.get('gender')?.setValue(value);
  }

  register() {
    const body = this.mainForm.getRawValue();
    body.phone = '966' + body.phone;

    if (this.pageType === 'SIGNUP_SINGLE')
      this.httpService
        .post('Accounts/Register', body)
        .subscribe(() => {
          this.alertService.success('Your account is created Successfully')
        this.router.navigateByUrl('/account/login')
        }
        );
    else
      this.httpService
        .post('Accounts/RegisterPartner', body)
        .subscribe((data) => {
          data ? this.router.navigateByUrl('/account/login') : '';
        });
  }

  login() {
    const body = JSON.parse(JSON.stringify(this.mainForm.value));
    body.username = '966' + body.username;

    this.httpService.post('Accounts/Login', body).subscribe((data) => {
      if (data) {
        localStorage.setItem('token', data.token);
        let phonenumber = `0${this.mainForm.value.username}`;
        this.localStorageService.setHash('phoneNumber',phonenumber);
        this.router.navigateByUrl('/home');
      }
    });
  }

  forget() {
    const body = JSON.parse(JSON.stringify(this.mainForm.value));
    body.phone ? (body.phone = '966' + body.phone) : '';

    if (this.isForgetPasswordSent) {
      if (this.forgetPasswordType === 'otp') {
        this.httpService
          .post('Accounts/CompleteResetPasswordOtp', body)
          .subscribe((data) => {
            data ? this.router.navigateByUrl('/account/login') : '';
          });
      } else {
        this.httpService
          .post('Accounts/CompleteResetPassword', body)
          .subscribe((data) => {
            data ? this.router.navigateByUrl('/account/login') : '';
          });
      }
    } else {
      this.httpService
        .post('Accounts/ResetPassword', body)
        .subscribe((data) => {
          if (data) {
            this.isForgetPasswordSent = true;

            if (this.forgetPasswordType === 'otp') {
              this.mainForm = this.fb.group(
                {
                  phone: [body.phone],
                  otp: ['', Validators.required],
                  token: [this.token],
                  password: [
                    '',
                    [Validators.required, Validators.minLength(8)],
                  ],
                  confirmPassword: [
                    '',
                    [Validators.required, Validators.minLength(8)],
                  ],
                },
                {
                  validators: this.mustMatch('password', 'confirmPassword'),
                }
              );
            } else {
              this.router.navigateByUrl('/account/login');
            }
          }
        });
    }
  }

  sendVerification() {
    const body = JSON.parse(JSON.stringify(this.mainForm.value));
    body.phone ? (body.phone = '966' + body.phone) : '';

    this.httpService
      .post('Accounts/SendVerificationCode', body)
      .subscribe((data) => {
        console.log(`🚀 ~ .subscribe ~ data`, data);
        const respData = { ...body, ...data };
        this.auth.authHolder = respData;
        this.isVerificationSent = true;
        this.router.navigate(['/account/register_comp']);
      });
  }

  complete() {
    const body = {
      userId: +this.userId,
      userTypeId: +this.customerId,
      name: this.mainForm.getRawValue().name,
      phone: this.mainForm.getRawValue().phone,
      password: this.mainForm.getRawValue().password,
      gender: this.mainForm.getRawValue().gender,
      dateOfBirth: this.mainForm.getRawValue().dateOfBirth,
    };

    this.httpService
      .post('Accounts/CompletePosRegistration', body)
      .subscribe(() => {
        this.router.navigateByUrl('/account/login');
      });
  }

  getActiveTab(event: number) {
    switch (event) {
      case 0:
        this.mainForm.get('type')?.setValue(1);
        this.mainForm.get('phone')?.disable();
        this.mainForm.get('email')?.enable();
        this.forgetPasswordType = '';
        break;
      case 1:
        this.mainForm.get('type')?.setValue(2);
        this.mainForm.get('email')?.disable();
        this.mainForm.get('phone')?.enable();
        this.forgetPasswordType = 'otp';
        break;
      default:
        break;
    }
  }

  onSignIn(googleUser: any) {
    // Useful data for your client-side scripts:
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Don't send this directly to your server!
    console.log('Full Name: ' + profile.getName());
    console.log('Given Name: ' + profile.getGivenName());
    console.log('Family Name: ' + profile.getFamilyName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail());

    // The ID token you need to pass to your backend:
    var id_token = googleUser.getAuthResponse().id_token;
    console.log('ID Token: ' + id_token);
  }

  onKeyUp(event: any) {
    let target = event.srcElement;

    let maxLength = parseInt(target.attributes['maxlength'].value, 10);
    let myLength = target.value.length;
    this.pinCode = '';

    if (myLength >= maxLength) {
      let next = target;

      while ((next = next.nextElementSibling)) {
        if (next == null) break;
        if (next.tagName.toLowerCase() == 'input') {
          next.focus();
          break;
        }
      }

      if (!next) {
        for (
          let index = 0;
          index <
          (document.querySelector('.pinCode-inputs')?.children
            .length as number);
          index++
        ) {
          const input = document.querySelector('.pinCode-inputs')?.children[
            index
          ] as HTMLInputElement;
          this.pinCode = this.pinCode += input.value;
        }

        this.mainForm.get('otp')?.setValue(this.pinCode);

        setTimeout(() => {
          document.getElementById('submitBtn')?.focus();
          // document.getElementById('submitBtn')?.click();
        }, 10);
      }
    }

    if (myLength === 0) {
      let next = target;
      while ((next = next.previousElementSibling)) {
        if (next == null) break;
        if (next.tagName.toLowerCase() == 'input') {
          next.focus();
          break;
        }
      }
    }
  }

  onKeyDown(event: any) {
    let target = event.srcElement;
    target.value = '';
  }

  changeLanguage() {
    this.translateService.changeLanguage();
  }

  openDialog(modalTemplate: any, type = '') {
    let config: any;
    switch (type) {
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

  // @HostListener('paste', ['$event'])
  // pastValue(event: any) {
  //   if (event.target.id === 'pin') {
  //     this.pinCode = event.clipboardData.getData('Text');

  //     setTimeout(() => {
  //       this.pinCode.split('').map((number, index) => {
  //         const input = document.querySelector('.pinCode-inputs')?.children[index] as HTMLInputElement;
  //         input ? input.value ? '' : input.value = number : '';
  //       });

  //       this.mainForm.get('otp') ? this.mainForm.get('otp')?.setValue(this.pinCode) : '';
  //       setTimeout(() => {
  //         document.getElementById('submitBtn')?.focus();
  //         // document.getElementById('submitBtn')?.click();
  //       }, 10);
  //     });
  //   }
  // }
}
