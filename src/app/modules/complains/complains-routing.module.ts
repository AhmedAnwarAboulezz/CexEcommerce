import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComplainsComponent } from './Pages/complains/complains.component';

const routes: Routes = [
  { path: '', component: ComplainsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComplainsRoutingModule { }
