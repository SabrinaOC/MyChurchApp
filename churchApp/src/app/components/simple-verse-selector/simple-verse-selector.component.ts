import { Component, OnInit } from '@angular/core';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-simple-verse-selector',
  templateUrl: './simple-verse-selector.component.html',
  styleUrls: ['./simple-verse-selector.component.scss'],
})
export class SimpleVerseSelectorComponent  implements OnInit {

  books: string[] = this.core.getAllBibleBooks()
  filteredBooks: string[] = [...this.books]; // Lista filtrada
  searchTerm: string = '';
  selectedBook: string = '';

  chapters: number = 0;
  selectedChapter: number = 0;

  verses: number = 0;

  constructor(public core: CoreProvider) { }

  ngOnInit() {
    console.log("");    
  }

  filterOptions() {
    console.log("Filtrando...");
    
    this.filteredBooks = this.books.filter(book =>
      book.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  selectBook(book: string) {
    this.selectedBook = book;
    this.searchTerm = book; // Mostrar el valor seleccionado en la barra de búsqueda
    this.chapters = this.core.getChapterCount(this.selectedBook) ?? 0;
  }

  selectChapter(chapter: number) {
    this.selectedChapter = chapter;

    this.verses = this.core.getVerses(this.selectedBook, this.selectedChapter) ?? 0;
  }

  generateRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
}
