import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ScreenComponent } from './components/screen/screen.component';
import { MobileComponent } from './components/mobile/mobile.component';
import { WelcomeComponent } from './components/mobile/welcome/welcome.component';


const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: ':id', component: HomeComponent},
  {path: 'screen/:id', component: ScreenComponent},
  {path: 'mobile/:id', component: WelcomeComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
