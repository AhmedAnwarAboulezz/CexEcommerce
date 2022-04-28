import { Component, OnInit } from '@angular/core';
import { TranslationService } from 'src/app/core/services/translation/translation.service';

@Component({
  selector: 'app-stores',
  templateUrl: './stores.component.html',
  styleUrls: ['./stores.component.scss']
})
export class StoresComponent implements OnInit {
  lang: any;

  constructor(private translateService: TranslationService) { }

  ngOnInit(): void {
    this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang;  });
  }

}
