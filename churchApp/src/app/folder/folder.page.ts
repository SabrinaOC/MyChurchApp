import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestService } from '../services/rest.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NewMessage } from '../model/interfaces';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  speakerList!: any
  form!: FormGroup
  constructor(
              private restService: RestService,
              private loading: LoadingController
  ) {
    this.form = new FormGroup({
      title: new FormControl(null, Validators.required),
      idSpeaker: new FormControl(null, Validators.required),
      url: new FormControl(null, Validators.required),
    })
  }

  ngOnInit() {
    console.log('PARAMS => ', this.activatedRoute.snapshot.params)
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    // this.getAllSpeakers()
    this.restService.getAllSpeakers().subscribe(res => {
      let result: any = res
      console.log('GET ALL SPEAKERS result=> ', result)
      if(result) {
        this.speakerList = result.data;
      }
    })
  }

  getAllSpeakers() {
    this.restService.getAllSpeakers().subscribe(res => {
      console.log('GET ALL SPEAKERS => ', res)
      let result: any = res
      if(result) {
        this.speakerList = result.data;
      }
    })
  }

  async addMessage() {
    let load = await this.loading.create()
    console.log('Enviar form => ', this.form.value)
    if(this.form.valid){
      const newMessage: NewMessage = this.form.value
      console.log('newMessage => ', newMessage)
      this.restService.addNewMessage(newMessage).subscribe(res => {
        console.log('RES insert message => ', res)
        load.dismiss()
        this.form.reset()
      })
    }
    load.dismiss()
  }
}
