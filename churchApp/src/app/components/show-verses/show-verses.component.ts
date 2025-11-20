import { Component, Input } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';
import { BibleReaderComponent } from '../bible-reader/bible-reader.component';

@Component({
  selector: 'app-show-verses',
  templateUrl: './show-verses.component.html',
  styleUrls: ['./show-verses.component.scss'],
})
export class ShowVersesComponent {

  @Input() public verse: string | undefined;

  constructor(public core: CoreProvider) { }

  async readChapter() {
    const modal = await this.core.modalCtrl.create({
      component: BibleReaderComponent,
      componentProps: {
        verse: this.verse
      }
    });
    modal.onDidDismiss().then(d => { });
    await modal.present();
  }
}
