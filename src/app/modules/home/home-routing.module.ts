import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { StoresComponent } from './components/stores/stores.component';
import { GiftboxComponent } from './components/giftbox/giftbox.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: '',  component: HomeComponent },
      { path: 'stores', component: StoresComponent },
      { path: 'gitbox', component: GiftboxComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
