import { Component, Input, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';
import { Product } from 'src/app/core/interfaces/product.interface';
import { TranslationService } from 'src/app/core/services/translation/translation.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  @Input() product!: Product;
  lang!: string;
  
  constructor(private translateService: TranslationService) { }

  ngOnInit(): void {
    this.translateService.currentLanguage$.pipe(first()).subscribe(lang => { this.lang = lang; });
  }

}
