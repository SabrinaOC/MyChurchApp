import { Component } from '@angular/core';
import { RestService } from './services/rest.service';
import { initializeApp } from "firebase/app";
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  accountPages = [
    {
      title: 'Predicaciones',
      url: '/message-list',
      ionicIcon: 'list-outline',
    },
    {
      title: 'Gestión contenido',
      url: '/add-message',
      ionicIcon: 'lock-closed-outline',
    },
    {
      title: 'Configuración',
      url: '',
      ionicIcon: 'settings-outline',
    },
  ];
  constructor(private restService: RestService) {
    restService.getAllBooks();
    restService.getAllSpeakers();
    // Initialize Firebase
    initializeApp(environment.firebaseConfig);
  }

}
