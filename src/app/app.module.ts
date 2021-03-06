import { BrowserModule,  HammerModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { environment } from 'src/environments/environment';
import { ScreenComponent } from './components/screen/screen.component';
import { AnQrcodeModule } from 'an-qrcode';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import { MobileComponent } from './components/mobile/mobile.component';
import { HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import { WelcomeComponent } from './components/mobile/welcome/welcome.component';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
export class HammerConfig extends HammerGestureConfig {
  overrides = {
    swipe: { direction: Hammer.DIRECTION_ALL }
  };
}
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ScreenComponent,
    MobileComponent,
    WelcomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AnQrcodeModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    HammerModule,
    FormsModule,
    BrowserModule,
    MatIconModule
  ],
  providers: [
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
