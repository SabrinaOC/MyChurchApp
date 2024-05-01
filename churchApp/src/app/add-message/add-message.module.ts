import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddMessagePageRoutingModule } from './add-message-routing.module';

import { AddMessagePage } from './add-message.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddMessagePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [AddMessagePage]
})
export class AddMessagePageModule {}
