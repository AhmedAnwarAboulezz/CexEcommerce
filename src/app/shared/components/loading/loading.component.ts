import { Component, OnInit } from '@angular/core';
import { LoadingService } from 'src/app/core/services/loading/loading.service';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  color = 'primary';
  mode = 'indeterminate';
  value = 50;
  isLoading = false;

  constructor(private loadingService: LoadingService) { }

  ngOnInit(): void {
    this.loadingService.isLoading.subscribe((isLoading) => this.isLoading = isLoading);
  }

}
