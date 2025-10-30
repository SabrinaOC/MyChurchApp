import { ChangeDetectorRef, Component } from '@angular/core';
import { initializeApp } from "firebase/app";
import { environment } from 'src/environments/environment';
import { AlertController, Platform } from '@ionic/angular';
import { App, AppInfo } from '@capacitor/app';
import { CoreProvider } from './services/core';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
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

  isAuthorized!: boolean;
  version!: string;

  constructor(private platform: Platform,
    public core: CoreProvider,
    private alrtCtrl: AlertController,
    private cdRef: ChangeDetectorRef
  ) {
    this.core.api.book.getAllBooks().subscribe({
      next: (books: any) => {
        this.core.bookList = books.bookList;
      }
    })
    this.core.api.speaker.getAllSpeakers().subscribe({
      next: (speakers: any) => {
        this.core.speakerList = speakers.speakerList;
      }
    })
    this.core.api.messageType.getMessageTypes().subscribe({
      next: (msgTypes: any) => {
        this.core.messageTypeList = msgTypes.messageTypeList;
      }
    })


    // Initialize Firebase
    initializeApp(environment.firebaseConfig);
    this.initialize();

    this.core.detectPrefersTheme();

    App.getInfo().then(res => {
      this.version = res.version
    })

    this.isAuthorized = localStorage.getItem('USER_CREDENTIALS') ? true : false;
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

  checkIfPermissionNeeded() {
    if(!localStorage.getItem('USER_CREDENTIALS')){
      this.checkPass()
    }
  }

  async checkPass(): Promise<void> {
    let alert = await this.alrtCtrl.create({
      header: 'Autorización',
      inputs: [
        {
          type: 'email',
          label: 'Introduce el email autorizado',
          placeholder: 'Email'
        },
        {
          type: 'password',
          label: 'Introduce contraseña',
          placeholder: 'Contraseña'
        }
      ],
      buttons: [
        {
          text: 'Salir',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: (e) => {
            let email = e[0]
            let password = e[1]
            // Initialize Firebase
            let auth = getAuth();
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential: { user: any; }) => {
              // Signed in 
              const user = userCredential.user;
              // console.log('logado. Usuario => ', user)
              localStorage.setItem('USER_CREDENTIALS', user.accessToken)
            })
            .catch((error: { code: any; message: any; }) => {
              // const errorCode = error.code;
              // const errorMessage = error.message;
              this.incorrectCredentialsModal()
            });
          }
        }
      ],
      backdropDismiss: false
    })

    alert.present()
  }

  async incorrectCredentialsModal() {
    let alert = await this.alrtCtrl.create({
      header: 'No autorizado',
      message: 'Usuario no autorizado. ¿Volver a introducir credenciales?',
      buttons: [
        {
          text: 'Aceptar',
          handler: () => {
            this.checkPass();
          }
        },
        {
          text: 'Salir',
          role: 'cancel'
        }
      ],
      backdropDismiss: false
    });

    alert.present();
  }

  closeAudioPlayer() {
    this.core.audio.selectMessage(null);
    this.cdRef.detectChanges(); //Force detecting changes
  }

  markAsListenedMessage(event: any) {
    event.preventDefault();
    this.core.audio.markAsListened(this.core.audio.selectedMessage!, event);
  }
}
