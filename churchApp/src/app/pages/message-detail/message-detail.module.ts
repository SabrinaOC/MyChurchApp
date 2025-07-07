import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessageDetailPageRoutingModule } from './message-detail-routing.module';

import { MessageDetailPage } from './message-detail.page';
import { FormatQuestionTextPipe } from "../../components/format-question-text.pipe";
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessageDetailPageRoutingModule,
    FormatQuestionTextPipe,
    ComponentsModule
],
  declarations: [MessageDetailPage]
})
export class MessageDetailPageModule {}
