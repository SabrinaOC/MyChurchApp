import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniAudioPlayerComponent } from './mini-audio-player/mini-audio-player.component';
import { DriveLinkPipe } from './drive-link.pipe';
import { IonicModule } from '@ionic/angular';

const COMPONENTS = [
  MiniAudioPlayerComponent
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [
    CommonModule, DriveLinkPipe, IonicModule
  ],
  exports: [MiniAudioPlayerComponent]
})
export class ComponentsModule { }
