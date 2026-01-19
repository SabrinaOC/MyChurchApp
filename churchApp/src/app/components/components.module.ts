import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MiniAudioPlayerComponent } from './mini-audio-player/mini-audio-player.component';
import { DriveLinkPipe } from './drive-link.pipe';
import { IonicModule } from '@ionic/angular';
import { ShareOptionsPopoverComponent } from './share-options-popover/share-options-popover.component';
import { SimpleVerseSelectorComponent } from './simple-verse-selector/simple-verse-selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ShowVersesComponent } from './show-verses/show-verses.component';
import { FilterModalComponent } from './filter-modal/filter-modal.component';
import { BibleReaderComponent } from './bible-reader/bible-reader.component';
import { CardOptionsPopoverComponent } from './card-options-popover/card-options-popover.component';
import { CardMessageComponent } from './card-message/card-message.component';

const COMPONENTS = [
  MiniAudioPlayerComponent,
  ShareOptionsPopoverComponent,
  SimpleVerseSelectorComponent,
  ShowVersesComponent,
  FilterModalComponent,
  BibleReaderComponent,
  CardOptionsPopoverComponent,
  CardMessageComponent
];

@NgModule({
  declarations: [COMPONENTS],
  imports: [
    CommonModule, DriveLinkPipe, IonicModule, FormsModule, ReactiveFormsModule
  ],
  exports: [COMPONENTS]
})
export class ComponentsModule { }
