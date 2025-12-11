import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { Book } from 'src/app/services/api/models';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-simple-verse-selector',
  templateUrl: './simple-verse-selector.component.html',
  styleUrls: ['./simple-verse-selector.component.scss'],
})
export class SimpleVerseSelectorComponent {

  @Input() public justBook: boolean = false;
  
  filteredBooks: Book[] = [...this.core.bookList]; // Filtered list
  searchTerm: string = '';
  selectedBook: Book | undefined;

  chapters: number = 0;
  selectedChapter: number = 0;
  selectedVerse: number = 0;
  selectedRange: number = 0;

  chapterVerses: number = 0;

  @Output() public verse: EventEmitter<any> = new EventEmitter();

  constructor(public core: CoreProvider, private popoverCtrl: PopoverController) { }

  filterOptions() {
    this.filteredBooks = this.core.bookList.filter(book =>
      book.name?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectBook(book: Book) {
    this.selectedBook = book;
    this.searchTerm = book.name ?? ''; // Show selected value at toolbar
    this.chapters = this.core.bible.getChapterCount(this.selectedBook.name!) ?? 0;

    if (this.justBook) {
      this.chooseVerse();
    }
  }

  selectChapter(chapter: number) {
    this.selectedChapter = chapter;

    this.chapterVerses = this.core.bible.getVerses(this.selectedBook!.name!, this.selectedChapter) ?? 0;
  }

  selectVerse(verse: number) {
    this.selectedVerse = verse;

    //If the selectedVerse is the last of the chapter, exit
    if (verse == this.chapterVerses) {
      this.chooseVerse();
    }
  }

  selectRange(range: number) {
    this.selectedRange = range;
    this.chooseVerse();
  }

  generateRange(start: number, end: number): number[] {
    return Array.from({ length: end - start }, (_, i) => i + start + 1);
  }


  chooseVerse() {
    let verse: string | Book = "";
    
    if (this.justBook) {
      verse = this.selectedBook!;
    } else {
      verse = `${this.selectedBook?.name} ${this.selectedChapter}:${this.selectedVerse}${this.selectedRange === 0 ? "" : "-" + this.selectedRange}`;
    }

    this.popoverCtrl.dismiss(verse);
  }
}
