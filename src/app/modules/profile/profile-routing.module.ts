import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './pages/profile/profile.component';
import { UpdateProfileComponent } from './pages/update-profile/update-profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'mine', pathMatch: 'full' },
  {
    path: 'mine',
    component: ProfileComponent
  },
  {
    path: 'update/:type',
    component: UpdateProfileComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
