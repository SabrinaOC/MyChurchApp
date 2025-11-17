import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BibleReferencePage } from './bible-reference.page';

const routes: Routes = [
  {
    path: '',
    component: BibleReferencePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BibleReferencePageRoutingModule {}
