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
    
    //TODO rm
    this.platform.ready().then(() => {
      this.isDesktop = this.platform.is('desktop')
      console.log('isDesktop => ', this.isDesktop)
    })

    // this.restService.getAllMessages().subscribe((data: any) => {
    //   if(data) {
    //     this.messageList = data.data
    //   }
    //   console.log('allMessages => ', this.messageList)
    // })
  }

  async ionViewWillEnter() {
    let loading = await this.loadingController.create()
    console.log('ionViewWillEnter')
    this.restService.getAllMessages().subscribe((data: any) => {
      if(data) {
        this.messageList = data.data
      }
      console.log('allMessages => ', this.messageList)
      loading.dismiss()
    })
  }

  /**
   * 
   * @param idBook 
   * @returns 
   */
  filterBook(idBook: number) {
    return this.restService.bookList.find(book => book.id == idBook)?.name
  }

  /**
   * 
   * @param idSpeaker 
   * @returns 
   */
  filterSpeaker(idSpeaker: number) {
    return this.restService.speakerList.find(speaker => speaker.id == idSpeaker)?.name
  }

}
