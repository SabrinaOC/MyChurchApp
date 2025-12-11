import { Component, Input } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';

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

  text: string = "";

  chapter: string = "";

  constructor(public core: CoreProvider) { }

  setText(verse: string) {
    const { book, chapter, verseStart, verseEnd } = this.parseVerseReference(verse);

    this.text = this.core.bible.getFullChapterText(book, chapter, parseInt(verseStart), parseInt(verseEnd))!;

    this.chapter = `${book} ${chapter}`;
  }


  parseVerseReference(ref: string) {
    const regex = /^(\d?\s?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*)\s+(\d+):(\d+)(?:-(\d+))?$/;

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
}
