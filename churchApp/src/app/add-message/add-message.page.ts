import { Component, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { NewMessage } from '../model/interfaces';
import { RestService } from '../services/rest.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-message',
  templateUrl: './add-message.page.html',
  styleUrls: ['./add-message.page.scss'],
})
export class AddMessagePage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  // speakerList!: any
  form!: FormGroup
  date: any = Date.now()
  datetime: any = Date.now()
  constructor(
              public restService: RestService,
              private loading: LoadingController,
              private toastCtrl: ToastController
  ) {
    this.form = new FormGroup({
      title: new FormControl(null, Validators.required),
      id_speaker: new FormControl(null, Validators.required),
      id_book: new FormControl(null),
      date: new FormControl(this.datetime),
      url: new FormControl(null, Validators.required),
    })
    
  }

  async ngOnInit() {

  }

  async addMessage() {
    console.log('Enviar form => ', this.form.value)
    if(this.form.valid){
      let load = await this.loading.create({
        message: 'Guardando predicación'
      })
      load.present();
      const newMessage: NewMessage = this.form.value
      console.log('newMessage => ', newMessage)
      this.restService.addNewMessage(newMessage).subscribe((res: any) => {
        console.log('RES insert message => ', res)
        load.dismiss()
        this.form.reset()
        this.presentSnakbar('Predicación guardada con éxito')

      })
    } else {
      this.form.markAllAsTouched();
      this.form.markAsDirty();
      this.presentSnakbar('Formulario incorrecto')
    }
  }

  async presentSnakbar(msg: string) {
    let snkbar = await this.toastCtrl.create({
      message: msg,
      duration: 2000
    })

    snkbar.present()
  }
}
