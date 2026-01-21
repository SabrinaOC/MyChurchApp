import { ChangeDetectionStrategy, Component, EventEmitter, input, OnInit, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Message } from 'src/app/models/interfaces';
import { AudioService } from 'src/app/services/audio.service';
import { CoreProvider } from 'src/app/services/core';
import { CardOptionsPopoverComponent } from '../card-options-popover/card-options-popover.component';

@Component({
  selector: 'app-card-message',
  templateUrl: './card-message.component.html',
  styleUrls: ['./card-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardMessageComponent  implements OnInit {

  message = input<Message>();
  @Output() removeFromListened = new EventEmitter<Message>();
  @Output() shareMessage = new EventEmitter<Message>();
  // @Input() public message!: Message;

  isPlaying: boolean = false;
  progress: number = 0;
  duration: number = 0;
  isLoading: boolean = false;

  navigationExtra: NavigationExtras = {};

  private subscription: Subscription = new Subscription();

  constructor(
    public core: CoreProvider,
    public audioService: AudioService,
    private router: Router,
    private popoverController: PopoverController,
  ) { }

  ngOnInit() {
    const subPlaying = this.core.audio.isPlaying$.subscribe(v => this.isPlaying = v);
    const subProgress =this.core.audio.progress$.subscribe(v => this.progress = v);
    const subDuration = this.core.audio.duration$.subscribe(v => this.duration = v);
    const subLoading= this.core.audio.isLoading$.subscribe(v => this.isLoading = v);

    this.subscription.add(subPlaying);
    this.subscription.add(subProgress);
    this.subscription.add(subDuration);
    this.subscription.add(subLoading); 

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  

  /**
   * 
   * @param message 
   */
  selectMessage() {
    if (this.message() && (!this.core.audio.selectedMessage || this.core.audio.selectedMessage.id !== this.message()?.id)) {
      this.core.audio.selectMessage(this.message() ?? null);
    } else {
      if (this.isPlaying) this.core.audio.pause();
      else this.core.audio.play();
    }
  }

  /**
   * 
   * 
   * @returns 
   */
  checkIfMessagePlaying(): Boolean {
    if (this.audioService.selectedMessage?.id === this.message()?.id && this.isPlaying && !this.isLoading){
      return true;
    } 
    return false;
  }

  /**
   * 
   * 
   * @returns 
   */
  cehckIfMsgSelected() {
    return this.audioService.selectedMessage?.id === this.message()?.id
  }

  /**
   * 
   * 
   * @returns 
   */
  checkIfMessageLoading(): Boolean {
    if (this.audioService.selectedMessage?.id === this.message()?.id && this.isLoading){
      return true;
    } 
    return false;
  }

  /**
   * 
   */
  openMsgDetail() {
    this.navigationExtra.queryParams = this.message();
    this.router.navigate(['message-detail'], this.navigationExtra)
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

  async openOptionsMenu(event: any, message: any) {
    event.stopPropagation();

    const popover = await this.popoverController.create({
      component: CardOptionsPopoverComponent,
      event: event,
      translucent: true,
      side: 'bottom', // Controla dónde aparece (puede ser 'start', 'end', etc.)
      alignment: 'end', // Alinea con el borde del icono
      componentProps: {
        // Pasar los datos necesarios al popover
        data: {
          message: message,
          listened: message.listened,
          isAuthUser: this.core.isAuthUser // Asumiendo que 'core' es accesible aquí
        }
      }
    });

    await popover.present();
    const { data } = await popover.onDidDismiss();

    if (data && data.action) {
      switch (data.action) {
        case 'edit':
          this.editMessage(message, event); 
          break;
        // case 'openDetail':
        //   this.openMsgDetail(message, event);
        //   break;
        case 'markAsListened':
          this.core.audio.markAsListened(message, event);
          break;
        case 'removeFromListened':
          this.removeFromListened.emit(message);
          break;
        case 'share':
          this.shareMessage.emit(message);
          break;
        default:
          break;
      }
    }
  }

}
