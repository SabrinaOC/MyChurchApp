import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationController, NavController } from '@ionic/angular';
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
    private router: Router,
    private animationCtrl: AnimationController
  ) {
    this.getMessageDetail();
  }

  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

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

  async openShowVerses(verse: string) {
    const modal = await this.core.modalCtrl.create({
      component: ShowVersesComponent,
      componentProps: { verse },
      cssClass: 'versesPopover',
      backdropDismiss: true,
      showBackdrop: true,
      enterAnimation: this.enterAnimation,
      leaveAnimation: this.leaveAnimation,
    });

    modal.present()
  }
}
