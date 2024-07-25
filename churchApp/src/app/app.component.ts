import { Component } from '@angular/core';
import { RestService } from './services/rest.service';
import { initializeApp } from "firebase/app";
import { environment } from 'src/environments/environment';
import { Platform } from '@ionic/angular';
import { App } from '@capacitor/app';
import { CoreProvider } from './services/core';
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
      url: '/settings',
      ionicIcon: 'settings-outline',
    },
  ];
  constructor(private restService: RestService,
    private platform: Platform,
    public core: CoreProvider
  ) {
    this.restService.getAllBooks();
    this.restService.getAllSpeakers();

    // Initialize Firebase
    initializeApp(environment.firebaseConfig);
    this.initialize();

    this.core.detectPrefersTheme();
  }

  initialize() {
    this.platform.ready().then(() => {
      this.handleBackButton();
    });
  }

  handleBackButton() {
    document.addEventListener('ionBackButton', (ev: any) => {
      ev.detail.register(10, () => {
        App.exitApp(); // Cierra la aplicación
      });
    });
  }

}
