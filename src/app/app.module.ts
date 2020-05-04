import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireDatabaseModule } from '@angular/fire/database/public_api';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { ScreenComponent } from './components/screen/screen.component';
import { AnQrcodeModule } from 'an-qrcode';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { MobileComponent } from './components/mobile/mobile.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ScreenComponent,
    MobileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AnQrcodeModule,
    MatListModule,
    MatCardModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
