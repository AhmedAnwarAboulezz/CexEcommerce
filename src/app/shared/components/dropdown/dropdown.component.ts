import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslationService } from 'src/app/core/services/translation/translation.service';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  lang = '';
  @Input() items: { id: any; nameEn: string; nameAr: string }[] = [];
  @Input() formGroup: FormGroup | any;
  @Input() controlName = '';
  @Input() label = '';
  @Input() clearable = false;
  @Input() searchable = false;
  @Input() bindValue= 'id';
  @Input() multiple= false;

  constructor(private translateService: TranslationService) { }

  ngOnInit(): void {
    this.translateService.currentLanguage$.subscribe(lang => this.lang = lang);
  }

}
