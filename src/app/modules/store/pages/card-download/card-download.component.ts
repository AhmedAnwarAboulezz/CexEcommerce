import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import * as JsBarcode from 'jsbarcode';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { StorageService } from 'src/app/shared/storage/storage.service';
import { StoreService } from '../services/store.service';

@Component({
  selector: 'app-card-download',
  templateUrl: './card-download.component.html',
  styleUrls: ['./card-download.component.scss']
})
export class CardDownloadComponent implements OnInit {
  lang: any;
  szSerialNmbr:any;
  cartCount = 0;
  
  cardDetails:any = {
    price:0,
    barCode:'',
    binCode:'',
    szScratchCode:'',
    backgroundImage:''
  };
  constructor(
    public route: ActivatedRoute,
    private translateService: TranslationService,
    private service:StoreService
  ) {
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang;  });
    this.route.params.subscribe((p: any) => { this.szSerialNmbr = p.id; });
   }

  ngOnInit(): void {
    this.service.getCardDetailsByCode(this.szSerialNmbr).subscribe(res => {
      this.getCard(res);
    });
    // let data = {amount:100, binCode:1254, szScratchCode: this.szScratchCode};
    // this.getCard(data);
;  }
  getCard(data:any){
    this.cardDetails.price = data.price;
    this.cardDetails.amount = data.amount;
    this.cardDetails.binCode = data.binCode;
    this.cardDetails.szScratchCode = data.szScratchCode;
    this.cardDetails.backgroundImage = data.backgroundImage;
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
      htmlToImage.toPng(node).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = imageName + '.png';
        link.href = dataUrl;
        link.click();
      });
    }
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
