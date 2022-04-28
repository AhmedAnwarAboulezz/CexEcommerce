import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'src/app/core/interfaces/table';
import { AlertService } from 'src/app/core/services/alert/alert.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { StoreService } from '../services/store.service';
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import * as JsBarcode from 'jsbarcode';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MultipleSend } from '../models/paymentTransaction';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss']
})
export class OrderDetailsComponent implements OnInit {
  lang: any;
  id:any;
  cartCount = 0;
  columns: Table[] = [];
  rows: any[] = [];
  sendAnother=false;
  showCard=false;
  mainForm!: FormGroup | any;
  whatsForm: FormGroup | any;
  sendAllForm: FormGroup | any;
  showWhatsForm =false;
  //bulksend = false;
  bulksend = true;
  bulkszSerialNmbr: any[] = [];
  disabledCheckBoxIndexes: any[] = [];
  //bulkBenficiaryMobile = "";

  @ViewChild('shareModal', { static: true }) shareModal: any;
  @ViewChild('cardModal', { static: true }) cardModal: any;
  @ViewChild('sendAllModal', { static: true }) sendAllModal: any;  
  cardDetails:any = {
    price:0,
    barCode:'',
    binCode:'',
    szScratchCode:'',
    backgroundImage:'',
    szSerialNmbr:''
  };
  constructor(
    public route: ActivatedRoute,
    private localStorage: StorageService,
    private alertService: AlertService,
    private router: Router,
    private service:StoreService,
    private translateService: TranslationService,
    private changeRef: ChangeDetectorRef,
    private fb: FormBuilder, private modal: MatDialog
    ) { }

  ngOnInit(): void {
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang;  });
    this.route.params.subscribe((p: any) => { this.id = p.id; });
    this.checkValidUser();
  }

  checkValidUser(){
    let token = localStorage.getItem('token');
    let phone = this.localStorage.getHash('phoneNumber');
    let expDate = this.localStorage.getHash('expireDate');
    let jwt = new JwtHelperService ();
    if(token !== undefined && token !== null && !jwt.isTokenExpired(token) && phone !== undefined && phone !== null && phone !== ""){
      this.generateColumns();
      this.getDetails();
    }
    else{
      if(phone == undefined || phone == null || phone == ""
      || expDate == undefined || expDate == null || new Date(expDate) <= new Date()
      )
      {
        this.alertService.warning('عفوا عليك تسجيل الدخول لطلباتك السابقة');
        this.router.navigate(['/store/card-login']);
      }
      else{
        this.generateColumns();
        this.getDetails();
      }
    }  
  }

  getDetails(){
    this.service.getOrderDetails(this.id).subscribe(res=>{
      this.rows = res;
      this.disabledCheckBoxIndexes= this.rows.filter(row => row.benficairyMobile !== null).map(a=>a.szSerialNmbr);
    });
  }
  resetBulkData(){
    this.bulkszSerialNmbr = [];
    //this.bulksend = false;
  }
  getBulkszSerialNmbrs():string{
    return this.bulkszSerialNmbr.join(', ');
   }
  isChecked(szSerialNmbr:string){
   return this.bulkszSerialNmbr.includes(szSerialNmbr);
  }
  setBulkSend(event:any, item:any){
    let checked = event.checked;
    if(checked) this.bulkszSerialNmbr.push(item);
    else this.bulkszSerialNmbr = this.bulkszSerialNmbr.filter(a=>a !== item);
    //  //let checked = event.target.checked;
  }
  sendToAnotherAll(){
      let inputs = this.mapMultipleSend();
      console.log(inputs);   
      this.service.SendMultipleToBeneficiary(inputs).subscribe(res=>{
        if(res !== undefined && res.isSuccess == true)
        {
          this.modal.closeAll();
          this.resetBulkData();
          this.alertService.success("تم ارسال البطاقات للمستفيد بنجاح");
          this.getDetails();
        }
      });   
  }
  showsendAllModal(){
    this.sendAllForm = this.fb.group({
        benficiaryMobileAll: ['',[Validators.required,Validators.minLength(9)]],
    });
    this.openDialog(this.sendAllModal);
  }
  mapMultipleSend():MultipleSend[]{
    let bulkFormValues:MultipleSend[] = [];
    this.bulkszSerialNmbr.forEach(item => {
      bulkFormValues.push({benficiaryMobile: this.sendAllForm.value.benficiaryMobileAll,szSerialNmbr: item});
    });
    return bulkFormValues;
  }
  
  generateColumns() {
    this.columns = [
      {
        title: 'STORE.orderNumber',
        rowPropertyName: 'orderNumber',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'STORE.barcode',
        rowPropertyName: 'barCode',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'STORE.szScratchCode',
        rowPropertyName: 'szScratchCode',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'STORE.binCode',
        rowPropertyName: 'binCode',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'STORE.price',
        rowPropertyName: 'price',
        className: 'meduim',
        type: 'data'
      },  
      {
        title: 'STORE.amount',
        rowPropertyName: 'amount',
        className: 'meduim',
        type: 'data'
      },      
      {
        title: 'STORE.benficairyMobile',
        rowPropertyName: 'benficairyMobile',
        className: 'meduim',
        type: 'data'
      },      
      {
        title: 'STORE.Actions',
        rowPropertyName: 'actions',
        className: 'meduim',
        type: 'action',
        actionType: 'button',
        actionIconName: ['STORE.previewCard', 'STORE.sendToAnother'],
        classNames: ['solid-btn-primary','solid-btn-secondry'],
      }
    ];
  }
  setChecked(event: any){
    console.log(event);
    this.bulkszSerialNmbr = event.filter((a : any)=> !this.disabledCheckBoxIndexes.includes(a.szSerialNmbr)).map((a:any) =>a.szSerialNmbr);
  }
  doAction(event: any) {
    console.log(event);    
    switch (event.actionType) {
      case 'STORE.previewCard':
        //this.downloadAsImage('Test','card-number');
        this.getCard(event.row);
        //this.getSurveyQuestions(2, event.row.id);
        break;
        case 'STORE.sendToAnother':
        this.sendMain(event.row);
        break;
      default:
        break;
    }
  }
  getCard(data:any){
    const whatsappForm = {
      whatsappMobile: ['',[Validators.required,Validators.minLength(9),Validators.maxLength(12)]],
    };

    this.whatsForm = this.fb.group(whatsappForm);

    this.showCard = true;
    this.cardDetails.price = data.price;
    this.cardDetails.amount = data.amount;
    this.cardDetails.barCode = data.barCode;
    this.cardDetails.binCode = data.binCode;
    this.cardDetails.szScratchCode = data.szScratchCode;
    this.cardDetails.backgroundImage = data.backgroundImage;
    this.cardDetails.szSerialNmbr = data.szSerialNmbr;

    this.openDialog(this.cardModal);
    //this.changeRef.detectChanges();
    setTimeout(() => {
      this.checkSerial();
    }, 50);
  }
  checkSerial(){
    let node = document.getElementById('barcode3');
    if(node !== null){
      JsBarcode('#barcode3', this.cardDetails.szScratchCode, {
        font: 'monospace',
        fontOptions: 'bold',
        fontSize: 18,
        textMargin: 3,
        height: 60,
        width: 2,
        
      });
    }
  }

  downloadAsImage(nodeId:string, imageName:string){
    let node = document.getElementById(nodeId);
    if(node !== null){
      htmlToImage.toJpeg(node).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = imageName + '.jpeg';
        link.href = dataUrl;
        link.click();
      });
    }
  }

  sendMain(data:any){
    if(data.benficairyMobile){
      this.alertService.warning("تم ارسال البطاقة لمستفيد من قبل");
    }
    else{
      this.sendAnother = true;
      const surveyForm = {
        szSerialNmbr:[data.szSerialNmbr,[Validators.required]],
        benficiaryMobile: ['',[Validators.required,Validators.minLength(9)]],
      };

      this.mainForm = this.fb.group(surveyForm);
      this.openDialog(this.shareModal);
    }
  }

  sendToWhatsapp(cardDetails:any){
    // let linkhref = 
    // `https://wa.me/${this.whatsForm.value.whatsappMobile}/?web URLs=https://localhost:4700/store/card-download/${cardDetails.szScratchCode}`;
    // let rr1 = encodeURIComponent(`With love we send gift card <a href="https://localhost:4700/store/card-download/${cardDetails.szScratchCode}">test</a>`);
    // let rr = encodeURIComponent(`https://localhost:4700/store/card-download/${cardDetails.szScratchCode}`);
    // let tes = `<a href="https://localhost:4700/store/card-download/${cardDetails.szScratchCode}">Test</a>`
    // let tt = this.toHTML(tes);
    //let mm = this.sanitized.bypassSecurityTrustHtml(node);
    // let rr = `&lt;a href="http://localhost:4200/store/card-download/${cardDetails.szScratchCode}" &gt;&lt;a&gt;`
    // let linkhref = `https://wa.me/${this.whatsForm.value.whatsappMobile}/?text=With love we send gift card <a href="https://localhost:4700/store/card-download/">test</a>`;
    const link2 = document.createElement('a');
    let currentDomain = window.location.href.split("store")[0];
    link2.href = `${currentDomain}store/card-download/${cardDetails.szSerialNmbr}`;
    let linkhref = `https://api.whatsapp.com/send/?phone=${this.whatsForm.value.whatsappMobile}&text=تم ارسال بطاقة الخير من السدحان لكم وللتفاصيل اضغط هنا \t \n \n ${link2}&app_absent=0`;
    const link = document.createElement('a');
    link.href = linkhref;
    link.target="_blank";
    link.click();
    // setTimeout(() => {
    //   let linkhref3 = `https://api.whatsapp.com/send/?phone=${this.whatsForm.value.whatsappMobile}&text=With love we send gift card&app_absent=0`;
    //   const link3 = document.createElement('a');
    //   link3.href = linkhref3;
    //   link3.target="_blank";
    //   link3.click();
    // }, 5000);

  }
  toHTML(input:string) : any {
    return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
}

  sendToAnother(){

    this.service.SendToBeneficiary(this.mainForm.value).subscribe(res=>{
      this.modal.closeAll();
      this.alertService.success("تم ارسال البطاقة للمستفيد بنجاح");
      this.getDetails();
    });
  }

  openDialog(modalTemplate: any) {
    const config = {
      autoFocus: false,
      panelClass: 'medium'
    };
    
    this.modal.open(modalTemplate, config);
  }

  
  getBackground(row: any): string{
    if (row.hasOwnProperty("benficairyMobile") && row.benficairyMobile !== null) {
      return '#9bff9b';
    }
    return '#fff';
  }

  getBack(backgroundImage:any):string{
    if(backgroundImage == undefined || backgroundImage == null || backgroundImage=="") return "url(/assets/images/empty/card_bg.png)";
    return `url(${backgroundImage})`;
  }

}
