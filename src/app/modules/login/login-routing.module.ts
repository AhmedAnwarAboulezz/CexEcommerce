import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { type: 'SIGNIN' },
  },
  {
    path: 'forget-password',
    component: LoginComponent,
    data: { type: 'FORGET_PASSWORD' },
  },
  {
    path: 'complete-profile',
    component: LoginComponent,
    data: { type: 'COMPLETE_PROFILE' },
  },
  {
    path: 'register',
    component: LoginComponent,
    data: { type: 'SELECTION' },
  },
  {
    path: 'register_verify',
    component: LoginComponent,
    data: { type: 'SEND_VERIFICATION' },
  },
  {
    path: 'register_comp',
    component: LoginComponent,
    data: { type: 'SIGNUP' },
  },
  {
    path: 'register_single',
    component: LoginComponent,
    data: { type: 'SIGNUP_SINGLE' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
