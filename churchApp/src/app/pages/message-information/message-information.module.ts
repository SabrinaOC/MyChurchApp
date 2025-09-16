import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessageInformationPageRoutingModule } from './message-information-routing.module';

import { MessageInformationPage } from './message-information.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessageInformationPageRoutingModule
  ],
  declarations: [MessageInformationPage]
})
export class MessageInformationPageModule {}
