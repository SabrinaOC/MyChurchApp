import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniAudioPlayerComponent } from './mini-audio-player/mini-audio-player.component';
import { DriveLinkPipe } from './drive-link.pipe';
import { IonicModule } from '@ionic/angular';
import { ShareOptionsPopoverComponent } from './share-options-popover/share-options-popover.component';

const COMPONENTS = [
  MiniAudioPlayerComponent,
  ShareOptionsPopoverComponent
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [
    CommonModule, DriveLinkPipe, IonicModule
  ],
  exports: [MiniAudioPlayerComponent, ShareOptionsPopoverComponent]
})
export class ComponentsModule { }
