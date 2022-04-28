import { Component, OnInit } from '@angular/core';
import { TranslationService } from './core/services/translation/translation.service';
import { AuthDataHolderService } from './modules/login/pages/login/auth-data-holder.service';
import { environment } from '../environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
 

  constructor(private translate: TranslationService,private auth: AuthDataHolderService) {}
  ngOnInit() {
    if (environment.production) {
      if (location.protocol === 'http:') {
        window.location.href = location.href.replace('http', 'https');
      }
    }
  }
  
}