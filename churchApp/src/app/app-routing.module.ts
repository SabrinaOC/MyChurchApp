import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'add-message',
    pathMatch: 'full'
  },
  {
    path: 'add-message',
    loadChildren: () => import('./add-message/add-message.module').then( m => m.AddMessagePageModule)
  },
  {
    path: 'message-list',
    loadChildren: () => import('./message-list/message-list.module').then( m => m.MessageListPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
