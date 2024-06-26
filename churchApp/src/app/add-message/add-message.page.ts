import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Message, NewMessage } from '../model/interfaces';
import { RestService } from '../services/rest.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-add-message',
  templateUrl: './add-message.page.html',
  styleUrls: ['./add-message.page.scss'],
})
export class AddMessagePage implements OnInit {
  form!: FormGroup;
  date: any = Date.now();
  datetime: any = Date.now();
  constructor(
    public restService: RestService,
    private loading: LoadingController,
    private toastCtrl: ToastController,
    private alrtCtrl: AlertController,
    private navCtrl: NavController
  ) {
    this.form = new FormGroup({
      title: new FormControl(null, Validators.required),
      id_speaker: new FormControl(null, Validators.required),
      id_book: new FormControl(null),
      date: new FormControl(this.datetime),
      url: new FormControl(null, Validators.required),
    });
  }

  ngOnInit() {
    console.log('init');
    
  }

  ionViewWillEnter() {
    this.checkPass()
  }

  async addMessage() {
    if (this.form.valid) {
      let load = await this.loading.create({
        message: 'Guardando predicación',
      });
      load.present();
      const newMessage: NewMessage = this.normalizeTitle();
      // console.log('newMessage => ', newMessage);
      this.restService.addNewMessage(newMessage)
      .subscribe({
        next: (res: any) => {
          console.log('RES insert message => ', res);
          this.form.reset();
          load.dismiss();
          this.presentSnakbar('Predicación guardada con éxito')
        },
        error: (err: Error) => {
          load.dismiss();
          this.presentSnakbar(
            'No se ha podido gaurdar la predicación. Vuelve a intentarlo en unos minutos'
          );
          console.log('ERROR: ', err)
        },
        complete: () => {
        }
      });
    } else {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
      this.presentSnakbar('Formulario incorrecto');
    }
  }

  async presentSnakbar(msg: string) {
    let snkbar = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
    });

    snkbar.present();
  }

  normalizeTitle(): Message {
    let normalized: Message = this.form.value
    let formTitle = normalized.title.toLowerCase()
    normalized.normalized_title = formTitle.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    return normalized
  }

  async checkPass(): Promise<void> {
    let alert = await this.alrtCtrl.create({
      header: 'Autorización',
      inputs: [
        {
          type: 'password',
          label: 'Introduce código de autenticación'
        }
      ],
      buttons: [
        {
          text: 'Salir',
          handler: () => {
            this.navCtrl.navigateForward('message-list')
          }
        },
        {
          text: 'Aceptar',
          handler: (e) => {
            console.log('ALERT = ', e)
            if(e[0] != environment.config.pass) {
              this.checkPass()
            }
          }
        }
      ],
      backdropDismiss: false
    })

    alert.present()
  }
}
