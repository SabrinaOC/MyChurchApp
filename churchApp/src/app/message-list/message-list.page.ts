import { Component, OnInit } from '@angular/core';
import { Message } from '../model/interfaces';
import { RestService } from '../services/rest.service';
import { LoadingController, Platform } from '@ionic/angular';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.page.html',
  styleUrls: ['./message-list.page.scss'],
})
export class MessageListPage implements OnInit {
  messageList!: Message[]
  isDesktop: boolean = false;
  constructor(
              private restService: RestService,
              private platform: Platform,
              private loadingController: LoadingController
  ) { }

  ngOnInit() {
    
  }

  async ionViewWillEnter() {
    let loading = await this.loadingController.create({
      message: 'Recuperando predicaciones...'
    })
    loading.present();
    console.log('ionViewWillEnter')
    this.restService.getAllMessages().subscribe((data: any) => {
      if(data) {
        this.messageList = data.messageList
      }
      loading.dismiss()
    })
  }

}
