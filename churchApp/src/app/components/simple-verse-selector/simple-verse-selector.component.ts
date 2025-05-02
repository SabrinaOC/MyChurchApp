import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-simple-verse-selector',
  templateUrl: './simple-verse-selector.component.html',
  styleUrls: ['./simple-verse-selector.component.scss'],
})
export class SimpleVerseSelectorComponent {

  books: string[] = this.core.getAllBibleBooks()
  filteredBooks: string[] = [...this.books]; // Lista filtrada
  searchTerm: string = '';
  selectedBook: string = '';

  chapters: number = 0;
  selectedChapter: number = 0;
  selectedVerse: number = 0;
  selectedRange: number = 0;

  verses: number = 0;

  @Output() public verse: EventEmitter<any> = new EventEmitter();

  constructor(public core: CoreProvider, private popoverCtrl: PopoverController) { }

  filterOptions() {
    this.filteredBooks = this.books.filter(book =>
      book.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectBook(book: string) {
    this.selectedBook = book;
    this.searchTerm = book; // Show selected value at toolbar
    this.chapters = this.core.getChapterCount(this.selectedBook) ?? 0;
  }

  selectChapter(chapter: number) {
    this.selectedChapter = chapter;

    this.verses = this.core.getVerses(this.selectedBook, this.selectedChapter) ?? 0;
  }

  selectRange(range: number) {
    this.selectedRange = range;
    this.chooseVerse();
  }

  generateRange(start: number, end: number): number[] {
    return Array.from({ length: end - start }, (_, i) => i + start + 1);
  }


  chooseVerse() {
    let verse = `${this.selectedBook} ${this.selectedChapter}:${this.selectedVerse}${this.selectedRange === 0 ? "" : "-" + this.selectedRange}`;

    this.popoverCtrl.dismiss(verse);
  }
}
