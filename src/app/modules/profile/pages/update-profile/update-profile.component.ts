import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/core/services/http/http.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrls: ['./update-profile.component.scss']
})
export class UpdateProfileComponent implements OnInit {

  type: string | null = null;
  resetForm!: FormGroup;
  showOTP = false;
  pinCode = '';

  constructor(private activatedRoute: ActivatedRoute, private fb: FormBuilder, private http: HttpService, private router: Router) { }

  ngOnInit(): void {
    this.type = this.activatedRoute.snapshot.paramMap.get('type');
    this.initForm();
  }

  // "oldPassword": "string",
  // "newPassword": "string",
  // "confirmNewPassword": "string"
  initForm() {
    switch (this.type) {
      case 'mobile':
        this.resetForm = this.fb.group({
          customerId: [+this.http.getUserToken().UserTypeId],
          newPhone: ['', Validators.required]
        });
        break;
      case 'password':
        this.resetForm = this.fb.group({
          oldPassword: ['', Validators.required],
          newPassword: ['', Validators.required],
          confirmNewPassword: ['', Validators.required]
        }, {
          validators: this.mustMatch('newPassword', 'confirmNewPassword')
        });
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

  changePassword() {
    this.http.post('Accounts/ChangePassword', this.resetForm.value).subscribe(data => {
      if (data) {
        this.router.navigateByUrl('/profile/mine');
      }
    });
  }

  reset() {
    const body = this.resetForm.value;
    
    if (this.showOTP) {
      this.http.put('Customers/CompleteUpdatePhone', body).subscribe(data => {
        if (data) {
          this.router.navigateByUrl('/');
        }
      });
    } else {
      body.newPhone = '966' + body.newPhone;
      this.http.put('Customers/UpdatePhone', body).subscribe(data => {
        if (data) {
          this.showOTP = true;
          this.resetForm = this.fb.group({
            customerId: [+this.http.getUserToken().UserTypeId],
            otp: ['', Validators.required]
          });
        }
      });
    }
  }

  onKeyUp(event: any) {
    let target = event.srcElement;

    let maxLength = parseInt(target.attributes["maxlength"].value, 10);
    let myLength = target.value.length;

    if (myLength >= maxLength) {
      let next = target;

      while (next = next.nextElementSibling) {
        if (next == null) break;
        if (next.tagName.toLowerCase() == "input") {
          this.pinCode = this.pinCode += event.target.value;
          next.focus();
          break;
        }
      }

      if (!next) {
        this.pinCode = this.pinCode += event.target.value;
        this.resetForm.get('otp')?.setValue(this.pinCode);
        
        setTimeout(() => {
          document.getElementById('submitBtn')?.focus();
          // document.getElementById('submitBtn')?.click();
        }, 10);
      }
    }

    if (myLength === 0) {
      let next = target;
      while (next = next.previousElementSibling) {
        if (next == null) break;
        if (next.tagName.toLowerCase() == "input") {
          next.focus();
          break;
        }
      }
    }
  }

  onKeyDown(event: any) {
    let target = event.srcElement;
    target.value = "";
  }
  
  @HostListener('paste', ['$event'])
  pastValue(event: any) {
    this.pinCode = event.clipboardData.getData('Text');

    setTimeout(() => {
      this.pinCode.split('').map((number, index) => {
        const input = document.querySelector('.pinCode-inputs')?.children[index] as HTMLInputElement;
        input ? input.value = number : '';
      });

      this.resetForm.get('otp') ? this.resetForm.get('otp')?.setValue(this.pinCode) : '';
      setTimeout(() => {
        document.getElementById('submitBtn')?.focus();
        // document.getElementById('submitBtn')?.click();
      }, 10);
    });
  }
}
