import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './sub-modules/material/material.module';
import { LoadingComponent } from './components/loading/loading.component';
import { RtlDirective } from './directives/rtl/rtl.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'ngx-moment';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { TableComponent } from './components/table/table.component';
import { CollapseContentComponent } from './components/collapse-content/collapse-content.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorComponent } from './components/paginator/paginator.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxDonutChartModule } from 'ngx-doughnut-chart';
import { ChartsModule } from 'ng2-charts';
import { ValidationHandlerPipe } from './pipes/validation-handler.pipe';
import { AttachmentComponent } from './components/attachment/attachment.component';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { StoreToolbarComponent } from './components/store-toolbar/store-toolbar.component';

@NgModule({
  declarations: [LoadingComponent, RtlDirective, DatepickerComponent, DropdownComponent, TableComponent, CollapseContentComponent, PaginatorComponent, ValidationHandlerPipe, AttachmentComponent, StoreToolbarComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
    MomentModule,
    NgbModule,
    ChartsModule,
    NgxChartsModule,
    NgxDonutChartModule,
    NgxQRCodeModule
  ],
  exports: [
    LoadingComponent,
    DatepickerComponent,
    DropdownComponent,
    CollapseContentComponent,
    TableComponent,
    PaginatorComponent,
    AttachmentComponent,
    RtlDirective,
    ValidationHandlerPipe,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgSelectModule,
    MomentModule,
    NgbModule,
    ChartsModule,
    NgxChartsModule,
    NgxDonutChartModule,
    NgxQRCodeModule,
    StoreToolbarComponent

    
  ]
})
export class SharedModule { }
