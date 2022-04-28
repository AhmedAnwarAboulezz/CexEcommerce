import { NgModule } from '@angular/core';
import {  RouterModule, Routes } from '@angular/router';
import {FamilyComponent} from './pages/family/family.component'

const routes: Routes = [
  { path: '', component: FamilyComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FamilyRoutingModule { }
