import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'message-list',
    pathMatch: 'full'
  },
  {
    path: 'add-message',
    loadChildren: () => import('./pages/add-message/add-message.module').then( m => m.AddMessagePageModule)
  },
  {
    path: 'message-list',
    loadChildren: () => import('./pages/message-list/message-list.module').then( m => m.MessageListPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'message-detail',
    loadChildren: () => import('./pages/message-detail/message-detail.module').then( m => m.MessageDetailPageModule)
  },  {
    path: 'bible-reference',
    loadChildren: () => import('./pages/bible-reference/bible-reference.module').then( m => m.BibleReferencePageModule)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
