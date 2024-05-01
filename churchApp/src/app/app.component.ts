import { Component } from '@angular/core';
import { RestService } from './services/rest.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  accountPages = [
    {
       title: 'Subir Predicación',
       url: '/add-message',
       ionicIcon: 'cloud-upload'
    },
    {
       title: 'Predicaciones',
       url: '/message-list',
       ionicIcon: 'list-outline'
    },
  ]
  constructor(
              private restService: RestService
  ) {
    restService.getAllBooks()
    restService.getAllSpeakers()
  }
}
