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

  shareOptions = [
    {
      format: "Formato simple",
      title: "@Title",
      text: "*@Title*. Te invito a escuchar esta predicación",
      url: "@Url",
      // dialogTitle: `${message.title}`,
    },
    {
      format: "Formato de preguntas",
      title: "@Title",
      text: "*@Title*. \n\n @Questions",
      url: "@Url",
    },
  ]

  selectedIndex: number = 0;

  result!: ShareOptions;

  @Input() public message!: Message;

  constructor(public core: CoreProvider) { }

  ngOnInit() {
    if (this.message) {
      this.prepareOptions();

      this.selectOption(this.selectedIndex);
    }
  }

  cancel() {
    return this.core.modalCtrl.dismiss(null, 'cancel');
  }

  /**
   * Prepare sharing options by replacing keywords
   */
  prepareOptions() {
    let i: number = 0;

    this.shareOptions.forEach(element => {   
      this.shareOptions[i].title = element.title?.replace("@Title", this.message.title);

      this.shareOptions[i].text = element.text?.replace("@Title", this.message.title).replace("@Questions", this.message.questions);

      this.shareOptions[i].url = element.url?.replace("@Url", this.message.url);

      i++;
    });
  }

  selectOption(i: number) {
    this.selectedIndex = i;
  }

}
