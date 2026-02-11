import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BibleReaderPage } from './bible-reader.page';

const routes: Routes = [
  {
    path: '',
    component: BibleReaderPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BibleReaderPageRoutingModule {}
