import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-card-login',
  templateUrl: './card-login.component.html',
  styleUrls: ['./card-login.component.scss']
})
export class CardLoginComponent implements OnInit {
  cartCount = 0;
  lang!: string;
  mainForm: FormGroup = new FormGroup({});
  isSentOtp = false;
  counter=60;
  constructor(private modal: MatDialog,
    private translateService: TranslationService,
    private fb: FormBuilder,
    private service:StoreService,
    private localStorage: StorageService,
    private alertService: AlertService,
    private router: Router,

    ) { 
      this.mainForm = this.fb.group({
        phoneNumber: ['', [Validators.required,Validators.minLength(9)]],
        otpCode: ['', [Validators.required,Validators.minLength(4),Validators.maxLength(4)]],
      });
    }

  ngOnInit(): void {
    this.translateService.currentLanguage$.subscribe((lang) => {
      this.lang = lang;
    });
    let phone = this.localStorage.getHash('phoneNumber');
    if(phone !== undefined && phone !== null && phone !== ""){
      this.mainForm.controls['phoneNumber'].setValue(phone);
    }
  }

  login() {
    let otpExepration = this.localStorage.getHash('otpexpiration');
    if(otpExepration == undefined || otpExepration == null || otpExepration == ""|| moment(otpExepration) < moment(new Date)){
      this.alertService.error("كود التحقق غير صالح");
    }
    else{
      this.service.isVerifiedOTP(this.mainForm.value.phoneNumber, this.mainForm.value.otpCode).subscribe(isvalid => {
        debugger;
        if(isvalid.result == true){
          this.localStorage.setHash('phoneNumber',this.mainForm.value.phoneNumber);
          let expDate = moment(new Date()).add(1,"days").toDate();
          this.localStorage.setHash('expireDate', expDate);
          this.router.navigate(['/store/my-orders']);
        }
        else{
          
             this.alertService.error("كود تحقق غير صالح");
        }
      });
    }
    
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

  sendOtp(){
    this.service.sendPrivateCode(this.mainForm.value.phoneNumber).subscribe(res=>{
      if(res !== undefined){
        this.showCounter();
        let expDate = moment(new Date()).add(5,"minutes").toDate();
        this.localStorage.setHash('otpexpiration', expDate);
      }
      console.log("OTPPP Res", res);
    });
  }

  showCounter(){
    this.isSentOtp = true;
    this.counter = 60;
    this.counterDecrese();
  }
  counterDecrese(){
    setTimeout(() => {
      this.counter = this.counter - 1;
      if(this.counter>0){
        this.counterDecrese();
      }
      else{
        this.isSentOtp = false;
      }
    }, 1000);
  }
}
