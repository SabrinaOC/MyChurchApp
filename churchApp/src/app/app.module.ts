import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { CoreProvider } from './services/core';
import { ComponentsModule } from "./components/components.module";
import { BackgroundMode } from '@awesome-cordova-plugins/background-mode/ngx';
import { Media } from '@awesome-cordova-plugins/media/ngx';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, ReactiveFormsModule, ComponentsModule],
  providers: [
    CoreProvider,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    BackgroundMode,
    Media
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
