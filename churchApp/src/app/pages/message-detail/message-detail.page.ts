import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
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
export class MessageDetailPage implements OnInit {

  msgSelected!: Message;
  verses: string[] = [];

  isPlaying = false;
  progress = 0;
  duration = 0;
  isLoading: boolean = false;

  navigationExtra: NavigationExtras = {};

  constructor(
    public core: CoreProvider,
    public navCtrl: NavController,
    private router: Router
  ) {
    this.getMessageDetail();
  }

  ngOnInit(): void {
    this.core.audio.isPlaying$.subscribe(v => this.isPlaying = v);
    this.core.audio.progress$.subscribe(v => this.progress = v);
    this.core.audio.duration$.subscribe(v => this.duration = v);
    this.core.audio.isLoading$.subscribe(v => { this.isLoading = v; });
  }

  getMessageDetail() {
    this.msgSelected = this.router.getCurrentNavigation()?.extras.queryParams as Message;

    if (!this.msgSelected) {
      this.navCtrl.navigateForward('message-list')
    }
    this.versesToList();
  }

  versesToList() {    
    if (this.msgSelected.verses) {
      this.verses = this.msgSelected.verses.split(";");
    }
  }

  /**
   * 
   * @param message 
   */
  editMessage(message: Message, event: any) {
    event.preventDefault();
    event.stopPropagation();
    
    this.navigationExtra.queryParams = message;
    this.router.navigate(['add-message'], this.navigationExtra)
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
      enterAnimation: this.core.enterShowVersesAnimation,
      leaveAnimation: this.core.leaveShowVersesAnimation,
    });

    modal.present()
  }

  togglePlay() {    
    if (!this.core.audio.selectedMessage || this.core.audio.selectedMessage.id !== this.msgSelected.id) {
      this.core.audio.selectMessage(this.msgSelected);
    } else {
      if (this.isPlaying) this.core.audio.pause();
      else this.core.audio.play();
    }
  }

  onSeek(event: any) {
    const value = event.detail.value;
    this.core.audio.seekTo(value);
  }
}
