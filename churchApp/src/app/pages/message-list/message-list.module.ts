import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessageListPageRoutingModule } from './message-list-routing.module';

import { MessageListPage } from './message-list.page';
import { MiniAudioPlayerComponent } from 'src/app/components/mini-audio-player/mini-audio-player.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessageListPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [MessageListPage, MiniAudioPlayerComponent]
})
export class MessageListPageModule {}
