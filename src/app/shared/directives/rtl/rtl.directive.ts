import { Directive, ElementRef, Renderer2 } from '@angular/core';
import { TranslationService } from 'src/app/core/services/translation/translation.service';

@Directive({
  selector: '[setRtl]'
})
export class RtlDirective {

  constructor(private elRef: ElementRef, private renderer: Renderer2, private translation: TranslationService) {
    this.switchClassBasedOnLanguage();
  }

  /*Switch rtl class based on the chosen language from Translation Service*/
  switchClassBasedOnLanguage() {
    this.translation.currentLanguage$.subscribe(land => {
      land === 'ar' ? this.renderer.addClass(this.elRef.nativeElement, 'rtl') : this.renderer.removeClass(this.elRef.nativeElement, 'rtl');
    });
  }
}
