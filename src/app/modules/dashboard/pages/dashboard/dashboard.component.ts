import { Component, OnInit } from '@angular/core';
import { Table } from 'src/app/core/interfaces/table';
import { HttpService } from 'src/app/core/services/http/http.service';
import { TranslationService } from 'src/app/core/services/translation/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  lang = '';
  columns: Table[] = [];
  rows: any = [];
  topTen: any = [];
  langSubscription!: Subscription;
  single: any = [];
  revenue: any = [];
  protection: any = [];
  action: any = [];
  view: any = [];
  Actual: any;

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = '';
  showYAxisLabel = true;
  yAxisLabel = '';

  colorScheme = {
    domain: ['#2285CA', '#2285CA', '#2285CA', '#2285CA']
  };

  public doughnutChartLabels: string[] = [];
  public doughnutChartData: number[] = [];

  constructor(private httpService: HttpService, private translateService: TranslationService) { }

  ngOnInit(): void {
    this.generateColumns();
    this.onResize();
    this.Resize();
    this.getTopTenSuppliers();
    this.getGroupedStatistics();
    this.getGroupedCustomersSales();
    this.langSubscription = this.translateService.currentLanguage$.subscribe(lang => { this.lang = lang; this.getTransactions(); });
  }

  onResize() {
    if (innerWidth > 1200) {
      this.view = [350, 300]
    }
    else if (innerWidth < 768) {
      this.view = [300, 285]
    } else {
      this.view = [170, 285]
    }
  }

  Resize() {
    if (innerWidth > 1200) {
      this.Actual = [600, 300]
    } else if (innerWidth < 768) {
      this.Actual = [420, 300];
    } else {
      this.Actual = [220, 300];
    }
  }

  getGroupedStatistics() {
    this.httpService.get('DashBoards/GetGroupedCustomerSalesBasket/60/60/60').subscribe(data => {
      console.log('original', data.customerStatistics);
      
      data.customerStatistics.map((each: any) => {
        this.doughnutChartData.push(+each.value);
        this.doughnutChartLabels.push(each.name);
      })
      // color === 'Active' ? '#5B64C0' : '#FF88CE'
      this.single = data.salesStatistics;
      this.revenue = [
        {
          name: '',
          series: data.avgBasketStatistics
        }
      ];
    });
  }
  //getCustomerStatistics() {
  //this.httpService.get('DashBoards/TotalCustomerStatistics/60').subscribe(data => {
  // let donut: any = [];
  // data.map((each: any) => donut.push({ label: each.name, value: +each.value, color: each.name === 'Active' ? '#5B64C0' : '#FF88CE' }));
  // this.donutChartData = donut ? donut : [];
  //});
  //}

  //GetSalesPerDaysStatistics() {
  // this.httpService.get('DashBoards/GetSalesPerDaysStatistics/60').subscribe(data => {
  //  this.single = data;
  // console.log(this.single)
  //});
  //}

  //GetAvgBasket() {
  //this.httpService.get('DashBoards/GetAvgBasket/60').subscribe(data => {
  //this.revenue = [
  //{
  // name: '',
  // series: data
  //}
  //];
  // console.log(this.revenue)
  //});
  //}

  getTopTenSuppliers() {
    this.httpService.get('DashBoards/GetTopTenSuppliers/60').subscribe(data => {
      this.topTen = data ? data : [];
      console.log(data);
    });
  }

  getGroupedCustomersSales() {
    this.httpService.get('DashBoards/GetGroupedCustomerSalesAndCustomerPerStore/60/60').subscribe(data => {
      this.protection = data.customerPerStore;
      console.log(this.protection);
      this.action = data.customerSalesPerStore;
      console.log(this.action)
    });
  }
  /*
  GetTopTenSuppliers() {
    this.httpService.get('DashBoards/GetCustomersPerStore/60').subscribe(data => {
      this.protection = data;
      console.log(this.protection)
    });
  }

  GetTopTenItems() {
    this.httpService.get('DashBoards/GetCustomersSalesPerStore/60').subscribe(data => {
      this.action = data;
      console.log(this.action)
    });
  }
*/

  generateColumns() {
    this.columns = [
      {
        title: 'Article Code',
        rowPropertyName: 'articleCode',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'Description Arabic',
        rowPropertyName: 'descriptionArabic',
        className: 'meduim',
        type: 'data'
      },
      {
        title: 'Description English',
        rowPropertyName: 'descriptionEnglish',
        className: 'meduim',
        type: 'data'
      }
    ];
  }

  getTransactions() {
    this.httpService.get('Dashboards/GetTopTenItems/60').subscribe(data => {
      let transactions: any[] = []
      data.map((each: any, index: number) => {
        transactions.push({
          id: each.id,
          articleCode: each.articleCode,
          descriptionArabic: each.descriptionArabic,
          descriptionEnglish: each.descriptionEnglish,
        });
      });

      this.rows = transactions;

    });
  }

  doAction(event: any) {
  }
}
