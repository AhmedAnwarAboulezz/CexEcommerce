import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  private defaultLang: string = environment.defaultLang;
  private language = '';

  private renderer: Renderer2 | any;
  private currentLanguage = new BehaviorSubject<string>(this.defaultLang);

  currentLanguage$ = this.currentLanguage.asObservable();

  constructor(private translate: TranslateService, private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initLanguage();
  }
  
  initLanguage() {
    const lang = localStorage.getItem('currentLang');

    if (lang) {
      this.language = lang;
      environment.defaultLang = this.language;
    } else {
      this.language = this.defaultLang;
      localStorage.setItem('currentLang', this.language);
    }

    this.translate.use(this.language);

    if (this.language === 'ar') {
      this.renderer.addClass(document.body, 'rtl');
      this.renderer.setAttribute(document.body, 'dir', 'rtl');
      this.currentLanguage.next(this.language);
    } else {
      this.renderer.removeClass(document.body, 'rtl');
      this.renderer.removeAttribute(document.body, 'dir', 'rtl');
      this.currentLanguage.next(this.language);
    }
  }

  changeLanguage() {
    this.language = this.language === 'en' ? 'ar' : 'en';
    environment.defaultLang = this.language;
    localStorage.setItem('currentLang', this.language);
    this.translate.use(this.language);

    if (this.language === 'ar') {
      this.renderer.addClass(document.body, 'rtl');
      this.renderer.setAttribute(document.body, 'dir', 'rtl');
      this.currentLanguage.next(this.language);
    } else {
      this.renderer.removeClass(document.body, 'rtl');
      this.renderer.removeAttribute(document.body, 'dir');
      this.currentLanguage.next(this.language);
    }
  }
}
