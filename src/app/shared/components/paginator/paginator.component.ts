import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslationService } from 'src/app/core/services/translation/translation.service';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.scss']
})
export class PaginatorComponent implements OnInit {

  currentPage = 1;
  translationSubscription: Subscription | any;
  currentLang = '';

  @Input() totalCount = 0;
  @Input() pageSize = 0;

  @Output() pageSelected: EventEmitter<number> = new EventEmitter();

  constructor(private translationService: TranslationService) { }

  ngOnInit(): void {
    this.translationSubscription = this.translationService.currentLanguage$.subscribe(currentLanguage => this.currentLang = currentLanguage);
  }

  ngOnDestroy(): void {
    this.translationSubscription.unsubscribe();
  }

  onPageChange(pageNumber: number) {
    this.pageSelected.emit(pageNumber);
  }
}
