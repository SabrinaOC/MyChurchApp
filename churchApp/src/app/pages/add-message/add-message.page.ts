import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, LoadingController, NavController, ToastController } from '@ionic/angular';
import { Message, NewMessage } from '../../models/interfaces';
import { RestService } from '../../services/rest.service';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-message',
  templateUrl: './add-message.page.html',
  styleUrls: ['./add-message.page.scss'],
})
export class AddMessagePage{
  form!: FormGroup;
  date: any = Date.now();
  datetime: any = Date.now();
  messageEdit!: Message;
  editableMessage!: Message | any;

  constructor(
    public restService: RestService,
    private loading: LoadingController,
    private toastCtrl: ToastController,
    private alrtCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router,
  ) {
    this.form = new FormGroup({
      title: new FormControl(null, Validators.required),
      id_speaker: new FormControl(null, Validators.required),
      id_book: new FormControl(null),
      date: new FormControl(this.datetime),
      url: new FormControl(null, Validators.required),
      id_message_type: new FormControl(null, Validators.required),
      note: new FormControl(null),
      questions: new FormControl(null),
      verses: new FormControl(null)
    });

    this.getEditableMessage()
  }

  ionViewWillEnter() {
    this.checkIfPermissionNeeded()
    this.form.get('id_speaker')?.valueChanges.subscribe(value => {
      if(value) {
        if(value === 5) {
          this.form.get('note')?.setValidators(Validators.required)
          this.form.get('note')?.updateValueAndValidity()
        } else {
          this.form.get('note')?.setValidators(null)
          this.form.get('note')?.updateValueAndValidity()
        }      
      }
    });
  }

  async addMessage() {
    if (this.form.valid) {
      let load = await this.loading.create({
        message: 'Guardando predicación',
      });
      load.present();
      const newMessage: NewMessage = this.normalizeTitle();
      
      if(this.editableMessage !== undefined) {
        //servicio editar
        const editMsg : Message = this.normalizeTitle();
        editMsg.id = this.editableMessage.id
        this.restService.updateMessage(editMsg)
        .subscribe({
          next: (res: any) => {
            this.form.reset();
            load.dismiss();
            this.presentSnakbar('Predicación actualizada con éxito')
            this.router.navigate(['message-list']);
          },
          error: (err: Error) => {
            load.dismiss();
            this.presentSnakbar(
              'No se ha podido guardar la predicación. Vuelve a intentarlo en unos minutos'
            );
            console.log('ERROR: ', err)
          },
          complete: () => {
          }
        });
      } else {
        //servicio add
        this.restService.addNewMessage(newMessage)
        .subscribe({
          next: (res: any) => {
            this.form.reset();
            load.dismiss();
            this.presentSnakbar('Predicación guardada con éxito')
          },
          error: (err: Error) => {
            load.dismiss();
            this.presentSnakbar(
              'No se ha podido guardar la predicación. Vuelve a intentarlo en unos minutos'
            );
            console.log('ERROR: ', err)
          },
          complete: () => {
          }
        });
      }

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

  getEditableMessage() {
    const queryParams = this.router.getCurrentNavigation()?.extras.queryParams;
    this.editableMessage = queryParams;
    
    this.form.reset(this.editableMessage);
    this.form.get('id_message_type')?.reset(this.editableMessage?.['messageType']?.id);
    this.form.get('id_speaker')?.reset(this.editableMessage?.['speaker']?.id);
    this.form.get('id_book')?.reset(this.editableMessage?.['book']?.id);

    this.datetime = new Date(this.editableMessage?.['date']).getTime();

    if(!this.editableMessage?.['date']) {
      this.datetime = new Date().getTime()
    }
  }

  async deleteMessage() {
    let load = await this.loading.create({
      message: 'Eliminando predicación',
    });
    load.present();
    this.restService.deleteMessage(this.editableMessage.id).subscribe({
      next: (res: any) => {
        this.form.reset();
        load.dismiss();
        this.presentSnakbar('Predicación eliminada con éxito')
        this.router.navigate(['message-list'])
      },
      error: (err: Error) => {
        load.dismiss();
        this.presentSnakbar(
          'No se ha podido eliminar la predicación. Vuelve a intentarlo en unos minutos'
        );
        console.log('ERROR: ', err)
      },
      complete: () => {
      }
    });
  }

  async openAlert() {
    let alert = await this.alrtCtrl.create({
      message: 'Eliminar contenido',
      buttons: [{
        text: 'Aceptar',
        handler: () => { this.deleteMessage() }
      },
      {
        text: 'Cancelar',
        role: 'cancel'
      }]
    })

    alert.present();
  }
}
