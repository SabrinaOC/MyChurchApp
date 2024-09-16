import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Message, NewMessage } from '../../models/interfaces';
import { RestService } from '../../services/rest.service';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

@Component({
  selector: 'app-add-message',
  templateUrl: './add-message.page.html',
  styleUrls: ['./add-message.page.scss'],
})
export class AddMessagePage {
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
      id_message_type: new FormControl(null, Validators.required),
      note: new FormControl(null)
    });
  }

  ionViewWillEnter() {
    this.checkIfPermissionNeeded()
    this.form.get('id_speaker')?.valueChanges.subscribe(value => {
      console.log('speaker CHANGED => ', value)
      if(value) {
        if(value === 5) {
          this.form.get('note')?.setValidators(Validators.required)
          this.form.get('note')?.updateValueAndValidity()
        } else {
          this.form.get('note')?.setValidators(null)
          this.form.get('note')?.updateValueAndValidity()
        }      
      }
    })
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
          handler: () => {
            this.navCtrl.navigateForward('message-list')
          }
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
          handler: () => {
            this.navCtrl.navigateForward('message-list')
          }
        }
      ],
      backdropDismiss: false
    });

    alert.present();
  }

  checkIfPermissionNeeded() {
    if(!localStorage.getItem('USER_CREDENTIALS')){
      this.checkPass()
    }
  }
}
