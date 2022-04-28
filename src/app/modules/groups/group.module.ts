import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupRoutingModule } from './group-routing.module';
import { GroupComponent } from './pages/group/group.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddgroupComponent } from './pages/addgroup/addgroup.component';
import { DetailsGroupComponent } from './pages/details-group/details-group.component';


@NgModule({
  declarations: [
    GroupComponent,
    AddgroupComponent,
    DetailsGroupComponent
  ],
  imports: [
    CommonModule,
    GroupRoutingModule,
    SharedModule
  ]
})
export class GroupModule { }
