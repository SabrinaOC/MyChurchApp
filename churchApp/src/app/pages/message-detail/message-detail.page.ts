import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Message } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';
import { Share } from '@capacitor/share';
import { ShareOptionsPopoverComponent } from 'src/app/components/share-options-popover/share-options-popover.component';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.page.html',
  styleUrls: ['./message-detail.page.scss'],
})
export class MessageDetailPage implements OnInit {

  msgSelected!: Message;
  verses: string[] = [];

  constructor(
    public core: CoreProvider,
    public navCtrl: NavController,
    private router: Router
  ) { }

  ngOnInit() {
    this.getMessageDetail();
  }

  getMessageDetail() {
    this.msgSelected = this.router.getCurrentNavigation()?.extras.queryParams as Message;
    this.versesToList();
    console.log(this.msgSelected);
  }

  versesToList() {
    this.verses = this.msgSelected.verses.split(";");
  }

  async shareMessage(event: any) {
    console.log("hola");
    event.stopPropagation()
    if (this.msgSelected.questions != null) {
      const modal = await this.core.modalCtrl.create({
        component: ShareOptionsPopoverComponent,
        componentProps: {
          message: this.msgSelected
        }
      });
      modal.onDidDismiss().then(d => {
        if (d.data) {
          // console.log(d.data);
          Share.share(d.data);
        }
      });
      await modal.present();
      
    } else {
      await Share.share({
        title: `${this.msgSelected.title}`,
        text: `*${this.msgSelected.title}*. \nTe invito a escuchar esta predicación.`,
        url: `${this.msgSelected.url}`,
        // dialogTitle: `${message.title}`,
      });
    }
  }

}
