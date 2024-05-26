import { Component, Inject, OnInit } from '@angular/core';
import { Message } from '../model/interfaces';
import { RestService } from '../services/rest.service';
import { LoadingController } from '@ionic/angular';
import { AppLauncher, AppLauncherPlugin } from '@capacitor/app-launcher';

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
              private loadingController: LoadingController,
  ) { }

  ngOnInit() {
    console.log('init')
  }

  async ionViewWillEnter() {
    let loading = await this.loadingController.create({
      message: 'Recuperando predicaciones...'
    })
    loading.present();
    console.log('ionViewWillEnter')
    this.restService.getAllMessages().subscribe((data: any) => {
      if(data) {
        this.messageList = data.messageListMapped
      }
      loading.dismiss()
    })
  }

  openUrl(targetUrl: string) {
    AppLauncher.openUrl({url: targetUrl})
  }

}
