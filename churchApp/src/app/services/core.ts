import { Injectable } from '@angular/core';
import { AlertController, AnimationController, LoadingController, ModalController, NavController, PopoverController, ToastController } from '@ionic/angular';
import { ApiService } from './api.service';
import { Book, MessageType, Speaker } from './api/models';
import { Router } from '@angular/router';
import { AudioService } from './audio.service';
import { BibleService } from './bible.service';

@Injectable({
  providedIn: 'root'
})
export class CoreProvider {
  public theme: 'dark' | 'light' = 'dark';

  messageTypeList: MessageType[] = [];
  speakerList: Speaker[] = [];
  bookList: Book[] = [];

  constructor(
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public popoverCtrl: PopoverController,
    public api: ApiService,
    public audio: AudioService,
    public bible: BibleService,
    public router: Router,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public animationCtrl: AnimationController
  ) { }

  public detectPrefersTheme() {
    let currentTheme: string | null = localStorage.getItem("theme");

    switch (currentTheme) {
      case 'dark':
        this.setDarkTheme();
        break;

      case 'light':
        this.setLightTheme();
        break;

      case null: //In the first time on the app, it will use default device theme
        const prefersDark: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

        if (prefersDark.matches) {
          this.setDarkTheme();
        } else {
          this.setLightTheme();
        }
        break;
    }
  }

  private setLightTheme() {
    this.theme = 'light';
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem("theme", this.theme);
  }

  private setDarkTheme() {
    this.theme = 'dark';
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem("theme", this.theme);
  }

  public toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
      this.setDarkTheme();
    } else {
      this.setLightTheme();
    }
  }


  normalizeText(text: string): string {
    let normalized: string = ''
    if(text) {
      let formTitle = text.toLowerCase().normalize("NFD");
      normalized = formTitle.replace(/[\u0300-\u036f]/g, "");;
    }
    return normalized;
  }

  public async adviceToast(color: string, message: string) {
    await (await this.toastCtrl.create({
      message: message,
      duration: 4000,
      cssClass: 'productToast',
      color: color,
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel',
          handler: () => { this.toastCtrl.dismiss() }
        }
      ]
    })).present();
  }


  async openAlert(message: string, acceptText: string = "Aceptar", cancelText: string = "Cancelar"): Promise<boolean> {
    return new Promise(async (resolve) => {
      let alert = await this.alertCtrl.create({
        message: message,
        buttons: [
          {
            text: acceptText,
            handler: () => { 
              resolve(true);
            }
          },
          {
            text: cancelText,
            role: 'cancel',
            handler: () => { 
              resolve(false);
            }
          }
        ]
      })
  
      alert.present();
    });
  }


    enterShowVersesAnimation = (baseEl: HTMLElement) => {
      const root = baseEl.shadowRoot;
  
      const backdropAnimation = this.animationCtrl
        .create()
        .addElement(root!.querySelector('ion-backdrop')!)
        .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
  
      const wrapperAnimation = this.animationCtrl
        .create()
        .addElement(root!.querySelector('.modal-wrapper')!)
        .keyframes([
          { offset: 0, opacity: '0', transform: 'scale(0)' },
          { offset: 1, opacity: '0.99', transform: 'scale(1)' },
        ]);
  
      return this.animationCtrl
        .create()
        .addElement(baseEl)
        .easing('ease-out')
        .duration(500)
        .addAnimation([backdropAnimation, wrapperAnimation]);
    };
  
    leaveShowVersesAnimation = (baseEl: HTMLElement) => {
      return this.enterShowVersesAnimation(baseEl).direction('reverse');
    };
}
