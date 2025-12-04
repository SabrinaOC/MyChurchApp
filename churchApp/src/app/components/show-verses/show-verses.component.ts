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
  @Input() public searchedTerm: string = "";

  bibleText: string = "";

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

  getBibleText(): string {    
    const text = this.core.bible.getBibleText(this.verse!);
    const term = this.searchedTerm || "";

    if (!term) {
      return text;
    }

    const normText = this.core.bible.normalizeText(text);
    const normTerm = this.core.bible.normalizeText(term);

    let result = "";
    let last = 0;

    // Búsqueda manual sin matchAll
    let index = normText.indexOf(normTerm);

    while (index !== -1) {
      result += text.slice(last, index) + 
        `<mark class="markTerm">${text.slice(index, index + term.length)}</mark>`;

      last = index + term.length;
      index = normText.indexOf(normTerm, last);
    }

    result += text.slice(last);

    return result;
  }
}
