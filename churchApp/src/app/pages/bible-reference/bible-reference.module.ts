import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BibleReferencePageRoutingModule } from './bible-reference-routing.module';

import { BibleReferencePage } from './bible-reference.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BibleReferencePageRoutingModule
  ],
  declarations: [BibleReferencePage]
})
export class BibleReferencePageModule {}
