import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyComponent } from './pages/family/family.component';
import { FamilyRoutingModule } from './family-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    FamilyComponent
  ],
  imports: [
    CommonModule,
    FamilyRoutingModule,
    SharedModule
  ]
})
export class FamilyModule { }
