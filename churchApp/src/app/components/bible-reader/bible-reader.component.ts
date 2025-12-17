import { Component, Input } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';
import { SimpleVerseSelectorComponent } from '../simple-verse-selector/simple-verse-selector.component';

@Component({
  selector: 'app-bible-reader',
  templateUrl: './bible-reader.component.html',
  styleUrls: ['./bible-reader.component.scss'],
})
export class BibleReaderComponent {

  private _verse: string | undefined;

  @Input()
  set verse(value: string | undefined) {
    this._verse = value;
    if (value) {
      this.setText(value);
    }
  }
  get verse() {
    return this._verse;
  }

  @Input() public asPage: boolean = false;

  text: string = "";
  chapter: string = "";

  constructor(public core: CoreProvider) { }

  setText(verse: string) {
    const { book, chapter, verseStart, verseEnd } = this.parseVerseReference(verse);

    this.text = this.core.bible.getFullChapterText(book, chapter, parseInt(verseStart), parseInt(verseEnd))!;

    this.chapter = `${book} ${chapter}`;
  }


  parseVerseReference(ref: string) {
    const regex = /^(\d?\s?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/;

    const match = ref.match(regex);
    
    if (!match) {
      throw new Error("Referencia bíblica inválida: " + ref);
    }

    return {
      book: match[1].trim(),
      chapter: match[2],
      verseStart: match[3],
      verseEnd: match[4] ?? match[3]
    };
  }

  async showSimpleVerseSelector(e: any) {
    const popover = await this.core.popoverCtrl.create({
      component: SimpleVerseSelectorComponent,
      translucent: true,
      cssClass: 'verse-selector-popover',
      event: e,
      alignment: 'center',
      side: 'top',
      componentProps: {justChapter: true}
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data) {      
      this.verse = data;
    }

  }

  getAdjacentChapter(direction: 'next' | 'prev' = 'next') {
    const splitIndex = this.verse?.search(/\s\d/);

    const verse = this.core.bible.getAdjacentChapter(this.verse?.substring(0, splitIndex)!, parseInt(this.verse?.substring(splitIndex!, this.verse.length)!), direction); 
    
    if (verse) this.verse = verse;
  }
}
