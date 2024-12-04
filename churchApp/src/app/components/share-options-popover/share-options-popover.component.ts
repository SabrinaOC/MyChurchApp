import { Component, Input, OnInit } from '@angular/core';
import { ShareOptions } from '@capacitor/share';
import { Message } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-share-options-popover',
  templateUrl: './share-options-popover.component.html',
  styleUrls: ['./share-options-popover.component.scss'],
})
export class ShareOptionsPopoverComponent  implements OnInit {

  shareOptions = {
    "shareOptions": [
      {
        "Formato simple": {
          title: "@Title",
          text: "*@Title*. Te invito a escuchar esta predicación",
          url: "$@Url",
          // dialogTitle: `${message.title}`,
        },
      },
      {
        "Formato de preguntas": {

        },
      }
    ]
  }

  result!: ShareOptions;

  @Input() public message!: Message;

  constructor(public core: CoreProvider) { }

  ngOnInit() {
    console.log(this.message);
    
    if (this.message) {
      this.shareOptions.shareOptions.forEach(element => {
        console.log(element);
        
      });
    }
  }

  cancel() {
    return this.core.modalCtrl.dismiss(null, 'cancel');
  }

}
