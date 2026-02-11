import { Component, Input, OnInit } from '@angular/core';
import { Share } from '@capacitor/share';
import { PopoverController } from '@ionic/angular';
import { Message } from 'src/app/models/interfaces';
import { ShareOptionsPopoverComponent } from '../share-options-popover/share-options-popover.component';
import { CoreProvider } from 'src/app/services/core';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-card-options-popover',
  templateUrl: './card-options-popover.component.html',
  styleUrls: ['./card-options-popover.component.scss'],
})
export class CardOptionsPopoverComponent  implements OnInit {

  // Recibe los datos necesarios del mensaje y el estado de autenticación
  @Input() data: any; 
  @Input() message!: Message;
  @Input() listened!: boolean;
  @Input() isAuthUser!: boolean;

  navigationExtra: NavigationExtras = {};

  constructor(private popoverController: PopoverController,
              private core: CoreProvider,
              private router: Router
  ) {}

  ngOnInit() {
    // La propiedad 'data' contendrá el mensaje y el estado de core.isAuthUser'
  }

  // Función para devolver la acción seleccionada y cerrar el popover
  action(actionName: string) {
    switch(actionName) {
      case 'share':
        this.shareMessage();
        break;
      case 'edit':
      this.editMessage();
        break;
      case 'markAsListened':
        // this.core.audio.markAsListened(this.data.message());
        break;
    }
    this.popoverController.dismiss({ action: actionName });
  }

  async shareMessage() {
    // event.stopPropagation()
    const message: Message = this.data.message();
    if (message.questions != null) {
      const modal = await this.core.modalCtrl.create({
        component: ShareOptionsPopoverComponent,
        componentProps: {
          message: message
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
        title: `${message.title}`,
        text: `*${message.title}*. \nTe invito a escuchar esta predicación.`,
        url: `${message.url}`,
        // dialogTitle: `${message.title}`,
      });
    }
  }

  editMessage() {
    let id;
    const message: Message = this.data.message();
    this.navigationExtra.queryParams = message;
    this.router.navigate(['add-message'], this.navigationExtra)
  }
}
