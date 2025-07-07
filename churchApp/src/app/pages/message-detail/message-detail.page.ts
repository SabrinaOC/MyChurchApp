import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Message } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';
import { Share } from '@capacitor/share';
import { ShareOptionsPopoverComponent } from 'src/app/components/share-options-popover/share-options-popover.component';
import { ShowVersesComponent } from 'src/app/components/show-verses/show-verses.component';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.page.html',
  styleUrls: ['./message-detail.page.scss'],
})
export class MessageDetailPage {

  msgSelected!: Message;
  verses: string[] = [];

  constructor(
    public core: CoreProvider,
    public navCtrl: NavController,
    private router: Router
  ) {
    this.getMessageDetail();
  }

  getMessageDetail() {
    this.msgSelected = this.router.getCurrentNavigation()?.extras.queryParams as Message;

    if (!this.msgSelected) {
      this.navCtrl.navigateForward('message-list')
    }
    this.versesToList();
  }

  versesToList() {
    this.verses = this.msgSelected.verses.split(";");
  }

  async shareMessage(event: any) {
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
