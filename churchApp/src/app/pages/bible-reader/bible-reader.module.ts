import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BibleReaderPageRoutingModule } from './bible-reader-routing.module';

import { ComponentsModule } from 'src/app/components/components.module';
import { BibleReaderPage } from './bible-reader.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BibleReaderPageRoutingModule,
    ComponentsModule
  ],
  declarations: [BibleReaderPage]
})
export class BibleReaderPageModule {}
