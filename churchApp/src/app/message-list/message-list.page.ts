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
    this.getAllMessages();
  }

  openUrl(targetUrl: string) {
    AppLauncher.openUrl({url: targetUrl})
  }

  async searchInput(event: any) {
    const query = event.target.value.toLowerCase();
    if(query && query != '' && query.length > 0) {
      let loading = await this.loadingController.create({
        message: 'Recuperando predicaciones...',
        cssClass: 'custom-loading',
        spinner: null,
      })
      loading.present();

      console.log('BUSQUEDA: ', query)
      this.restService.getMessagesByTitle(query).subscribe({
        next: (val: any) => {
          this.messageList = val.messageListMapped
        },
        error: (e) => {
          console.log('ERROR ', e)
        },
        complete: () => {
          loading.dismiss()
        }
      })
    }
  }

  async getAllMessages() {
    let loading = await this.loadingController.create({
      message: 'Recuperando predicaciones...',
      cssClass: 'custom-loading',
      spinner: null,
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

}
