import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './core/components/layout/layout.component';
import { AuthGuard } from './core/guards/auth/auth.guard';
import { PermissionGuard } from './core/guards/permission/permission.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'account',
    pathMatch: 'full'
  },
  {
    path: 'account',
    canActivate: [AuthGuard],
    loadChildren: () => import('./modules/login/login.module').then(m => m.LoginModule)
  },
  {
    path: 'store',
    loadChildren: () => import('./modules/store/store.module').then(m => m.StoreModule)
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'home',
        canActivate: [PermissionGuard],
        data: { allowedUserTypes: [2] }, // customer
        loadChildren: () => import('./modules/home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'invoices',
        canActivate: [PermissionGuard],
        data: { allowedUserTypes: [2] }, // customer
        loadChildren: () => import('./modules/invoices/invoices.module').then(m => m.InvoicesModule)
      },
      {
        path: 'profile',
        canActivate: [PermissionGuard],
        data: { allowedUserTypes: [2] }, // customer
        loadChildren: () => import('./modules/profile/profile.module').then(m => m.ProfileModule)
      },
      {
        path: 'family',
        canActivate: [PermissionGuard],
        data: { allowedUserTypes: [2] }, // customer
        loadChildren: () => import('./modules/family/family.module').then(m => m.FamilyModule)
      },
      {
        path: 'search',
        canActivate: [PermissionGuard],
        data: { allowedUserTypes: [1,5] }, // admin & Store
        loadChildren: () => import('./modules/search/search.module').then(m => m.SearchModule)
      },
      {
        path: 'dashboard',
        canActivate: [PermissionGuard],
        data: { allowedUserTypes: [1, 3, 6] }, // Admin & Mareking & Topmanagement
        loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: 'complains',
        canActivate: [PermissionGuard],
        data: { allowedUserTypes: [1,4] }, // Support
        loadChildren: () => import('./modules/complains/complains.module').then(m => m.ComplainsModule)
      },
      {
        path: 'content',
        canActivate: [PermissionGuard],
        data: { allowedUserTypes: [1] }, // Content Management
        loadChildren: () => import('./modules/content-management/content-management.module').then(m => m.ContentManagementModule)
      },
      {
        path: 'group',
        canActivate: [PermissionGuard],
        data: { allowedUserTypes: [1, 3, 6 , 4] }, // Admin & Mareking & Topmanagement
        loadChildren: () => import('./modules/groups/group.module').then(m => m.GroupModule)
      },
    ]
  },
  {
    path: 'error',
    loadChildren: () => import('./modules/error/error.module').then(m => m.ErrorModule),
  },
  { path: '**', redirectTo: '/error/404'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
