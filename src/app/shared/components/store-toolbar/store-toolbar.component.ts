import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService } from 'src/app/core/services/translation/translation.service';

@Component({
  selector: 'app-store-toolbar',
  templateUrl: './store-toolbar.component.html',
  styleUrls: ['./store-toolbar.component.scss']
})
export class StoreToolbarComponent implements OnInit {
  lang: any;
  @Input() cartCount = 0;
   
  constructor(
    private translateService: TranslationService,
    private router: Router
    ) { }

  ngOnInit(): void {
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang;  });
  }

  goToMyCards(){
    this.router.navigate(['/store/my-cart']);
  }
  goToMyOrders(){
    this.router.navigate(['/store/my-orders']);
  }
  goToTerms(){
    this.router.navigate(['/store/terms-conditions']);
  }
  changeLanguage() {
    window.location.reload();
    this.translateService.changeLanguage();
  }

}
