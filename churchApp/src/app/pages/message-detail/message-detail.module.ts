import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessageDetailPageRoutingModule } from './message-detail-routing.module';

import { MessageDetailPage } from './message-detail.page';
import { FormatQuestionTextPipe } from "../../components/format-question-text.pipe";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessageDetailPageRoutingModule,
    FormatQuestionTextPipe
],
  declarations: [MessageDetailPage]
})
export class MessageDetailPageModule {}
