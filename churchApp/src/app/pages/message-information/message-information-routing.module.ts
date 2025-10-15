import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessageInformationPage } from './message-information.page';

const routes: Routes = [
  {
    path: '',
    component: MessageInformationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessageInformationPageRoutingModule {}
