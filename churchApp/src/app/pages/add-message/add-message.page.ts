import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AlertController, LoadingController, NavController, PopoverController, ToastController } from '@ionic/angular';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { ActivatedRoute, Router } from '@angular/router';
import { CoreProvider } from 'src/app/services/core';
import { SimpleVerseSelectorComponent } from 'src/app/components/simple-verse-selector/simple-verse-selector.component';
import { Book, Message, MessageType, NewMessage } from 'src/app/services/api/models';
import { RestService } from 'src/app/services/rest.service';

@Component({
  selector: 'app-add-message',
  templateUrl: './add-message.page.html',
  styleUrls: ['./add-message.page.scss'],
})
export class AddMessagePage implements OnInit {
  form!: FormGroup;
  datetime: any = Date();
  messageEdit!: Message;
  editableMessage!: Message | any;
  manuallyAddedVerses: string = "";
  verses = new Map<number, string>();
  newVerseId: number = 0;
  editMode: boolean = false;

  messageBook: string = ""

  constructor(
    public restService: RestService,
    private loading: LoadingController,
    private toastCtrl: ToastController,
    private alrtCtrl: AlertController,
    public navCtrl: NavController,
    private popoverCtrl: PopoverController,
    private router: Router,
    public core: CoreProvider
  ) {
    this.form = new FormGroup({
      title: new FormControl(null, Validators.required),
      idSpeaker: new FormControl(null, Validators.required),
      idBook: new FormControl(null),
      date: new FormControl(this.datetime),
      url: new FormControl(null, Validators.required),
      idMessageType: new FormControl(null, Validators.required),
      note: new FormControl(null),
      questions: new FormControl(null),
      verses: new FormControl(null)
    });

    this.getEditableMessage();
  }

  ngOnInit(): void {
    this.datetime = new Date().toISOString();
    this.form.get('date')?.setValue(this.datetime); 
  }

  ionViewWillEnter() {
    this.checkIfPermissionNeeded()
    this.form.get('idSpeaker')?.valueChanges.subscribe(value => {
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
      // const newMessage: NewMessage = this.normalizeTitle();
      
      if(this.editableMessage !== undefined) {
        //servicio editar
        let editMsg : Message = this.form.value
        editMsg.normalizedTitle = this.normalizeTitle();
        editMsg.id = this.editableMessage.id
        
        this.core.api.message.updateMessage({body: editMsg})
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
            this.verses.clear();
            this.messageBook = "";
          }
        });
      } else {
        let newMessage: NewMessage = this.form.value
        newMessage.normalizedTitle = this.normalizeTitle();
        //servicio add
        this.core.api.message.addMessage({body: newMessage})
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
            this.verses.clear();
            this.messageBook = "";
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

  normalizeTitle(): string {
    let normalized: Message = this.form.value
    let title: string = ''
    if(normalized.title) {
      let formTitle = normalized?.title.toLowerCase()
      normalized.normalizedTitle = formTitle.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    }
    return title
    // let normalized: Message = this.form.value
    // if(normalized.title) {
    //   let formTitle = normalized?.title.toLowerCase()
    //   normalized.normalizedTitle = formTitle.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    // }
    // return normalized
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
    this.form.get('idMessageType')?.reset(this.editableMessage?.['messageType']?.id);
    this.form.get('idSpeaker')?.reset(this.editableMessage?.['speaker']?.id);
    this.form.get('idBook')?.reset(this.editableMessage?.['book']?.id);

    this.datetime = new Date(this.editableMessage?.['date']).getTime();

    this.messageBook = this.editableMessage?.book.name;

    if(!this.editableMessage?.['date']) {
      this.datetime = new Date().getTime()
    }

    this.manuallyAddedVerses = this.form.get('verses')?.value
    this.addVersesManually();
    //Set edit mode variable
    this.editMode = this.editableMessage?.title ? true : false;
  }

  async deleteMessage() {
    this.core.openAlert("Eliminar contenido").then(async (accepted) => {
      if (accepted) {        
        let load = await this.loading.create({
          message: 'Eliminando predicación',
        });
        load.present();
        
        this.core.api.message.deleteMessage({ body: {id: this.editableMessage.id} })
        .subscribe({
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
    })
  }

  navigateBack() {
    if (this.form.dirty) {
      this.core.openAlert("Ha realizado cambios. ¿Desea salir?", "Salir", "Cancelar").then(async (accepted) => {
        if (accepted) {
          this.core.navCtrl.navigateBack('');
        }
      });
    } else {
      this.core.navCtrl.navigateBack('');
    }
  }

  async showSimpleBookSelector(event: any) {
    event.preventDefault();

    const popover = await this.popoverCtrl.create({
      component: SimpleVerseSelectorComponent,
      translucent: true,
      cssClass: 'verse-selector-popover',
      componentProps: {justBook: true}
    });
  
    await popover.present();
  
    const { data } = await popover.onDidDismiss<Book>();
    if (data) {
      console.log(data);
      this.messageBook = data.name!;
      console.log(this.messageBook);
      this.form.get('idBook')?.setValue(data.id);
    }
  }

  async showSimpleVerseSelector() {
    const popover = await this.popoverCtrl.create({
      component: SimpleVerseSelectorComponent,
      translucent: true,
      cssClass: 'verse-selector-popover',
    });
  
    await popover.present();
  
    const { data } = await popover.onDidDismiss();
    if (data) {
      this.verses.set(this.newVerseId, data);
      this.newVerseId++;

      this.versesToForm();
    }
  }

  versesArray(): [number, string][] {
    return Array.from(this.verses.entries());
  }

  removeVerse(verseId: number) {
    this.verses.delete(verseId);

    this.versesToForm();
  }

  addVersesManually() {  
    if (!this.manuallyAddedVerses) {
      return
    }
      
    let wrongVerses: string[] = [];
    let verses: string[] = this.manuallyAddedVerses.split(";");
    
    if (verses.length === 0) {
      return
    }

    verses.forEach((verse) => {
      if (this.core.bible.verseExists(verse)) {
        // console.log("Correct: " + verse);
        this.verses.set(this.newVerseId, verse);
        this.newVerseId++;

        this.versesToForm();
      } else {
        // console.log("Incorrect: " + verse);
        wrongVerses.push(verse);
      }
    });

    if (wrongVerses.length > 0) {
      let strError: string = "";
      
      if (wrongVerses.length === 1) {
        strError = "Uno de los versículos introducidos manualmente no existe en la Biblia: " + wrongVerses[0];
      } else {
        strError = "Algunos versículos introducidos manualmente no existen en la Biblia";
      }

      this.core.adviceToast("danger", strError);
    }

    this.manuallyAddedVerses = "";
  }

  /**
   * Assing selected verses to verses form value
   */
  versesToForm() {
    let stringVerses: string = "";
    this.verses.forEach((verse) => {
      stringVerses += verse + ";";
    });

    stringVerses = stringVerses.endsWith(";") ? stringVerses.slice(0, stringVerses.length - 1) : stringVerses;

    this.form.get('verses')?.setValue(stringVerses);  
  }
}