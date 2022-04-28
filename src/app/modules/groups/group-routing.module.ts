import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddgroupComponent } from './pages/addgroup/addgroup.component';
import { DetailsGroupComponent } from './pages/details-group/details-group.component';
import { GroupComponent } from './pages/group/group.component';

const routes: Routes = [
  { path: '', redirectTo: 'group', pathMatch: 'full' },

  { path: '', component: GroupComponent },
  {
    path: 'add/:id',
    component: AddgroupComponent
  },
  {
    path: 'details/:id',
    component: DetailsGroupComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoutingModule { }
