import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniAudioPlayerComponent } from './mini-audio-player/mini-audio-player.component';
import { DriveLinkPipe } from './drive-link.pipe';
import { IonicModule } from '@ionic/angular';
import { ShareOptionsPopoverComponent } from './share-options-popover/share-options-popover.component';
import { SimpleVerseSelectorComponent } from './simple-verse-selector/simple-verse-selector.component';
import { FormsModule } from '@angular/forms';

const COMPONENTS = [
  MiniAudioPlayerComponent,
  ShareOptionsPopoverComponent,
  SimpleVerseSelectorComponent
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [
    CommonModule, DriveLinkPipe, IonicModule, FormsModule
  ],
  exports: [MiniAudioPlayerComponent, ShareOptionsPopoverComponent, SimpleVerseSelectorComponent]
})
export class ComponentsModule { }
