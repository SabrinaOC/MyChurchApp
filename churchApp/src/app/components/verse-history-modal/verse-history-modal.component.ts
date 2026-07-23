import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Book, MessageFilterOpt } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';
import { SimpleVerseSelectorComponent } from '../simple-verse-selector/simple-verse-selector.component';

@Component({
  selector: 'app-verse-history-modal',
  templateUrl: './verse-history-modal.component.html',
  styleUrls: ['./verse-history-modal.component.scss'],
})
export class VerseHistoryModalComponent {

  constructor(public core: CoreProvider) { }

  cancel() {
    this.core.modalCtrl.dismiss(null, 'cancel');
  }

  confirm(verse: string) {
    this.core.modalCtrl.dismiss(verse);
  }
}
