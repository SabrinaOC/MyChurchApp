import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsonBible from '../../assets/bible.json';

export interface VerseObject {
    book: string
    verse: string
    text: string
}

@Injectable({
  providedIn: 'root'
})
export class BibleService {

  private bibleStructure: any = jsonBible;

  private bibleRVR1960: any;
  private bibleTitles: any;

  public showBibleTittles: boolean = true;

  public lastChapterRead: string = "Génesis 1"

  constructor(private http: HttpClient) {
    this.loadBibleRVR1960();
  }


  public getAllBibleBooks(): string[] {
    let books: string[] = Object.keys(this.bibleStructure['Antiguo Testamento']).concat(Object.keys(this.bibleStructure['Nuevo Testamento']))

    return books;
  }

  public getChapterCount(bookName: string): number | null {
    for (const testament of Object.values(this.bibleStructure) as any) {
      if (bookName in testament) {
        const chapters = Object.keys((testament as any)[bookName]);
        return chapters.length;
      }
    }
    return null; // Not found book
  }

  public getVerses(bookName: string, chapter: number): number | null {
    for (const testament of Object.values(this.bibleStructure) as any) {
      if (bookName in testament) {
        const book = (testament as any)[bookName];
        const verses = book[chapter];
        return verses ?? null;
      }
    }
    return null; // Book or chapter not found
  }

  public verseExists(ref: string): boolean {
    const match = ref.trim().match(/^([\w\sáéíóúÁÉÍÓÚñÑ]+)\s+(\d+):(\d+)(?:-(\d+))?$/);

    if (!match) return false;

    const [, book, chapterStr, startVerseStr, endVerseStr] = match;
    const chapter = parseInt(chapterStr, 10);
    const startVerse = parseInt(startVerseStr, 10);
    const endVerse = endVerseStr ? parseInt(endVerseStr, 10) : startVerse;

    for (const testament of Object.values(this.bibleStructure) as any) {
      if (book in testament) {
        const bookData = (testament as any)[book];
        const totalVerses = bookData[chapter];

        return (
          totalVerses !== undefined &&
          startVerse >= 1 &&
          endVerse >= startVerse &&
          endVerse <= totalVerses
        );
      }
    }

    return false;
  }

  private loadBibleRVR1960() {
    this.http.get('../../assets/RVR1960 - Spanish.json').subscribe(data => {
      console.log("Loaded Bible RVR1960");
      this.bibleRVR1960 = data;
    });

    this.http.get("../../assets/Bible Titles RVR1960.json").subscribe(data => {
      this.bibleTitles = data;
    });
  }

  public getBibleText(verseReference: string): string {
    if (!this.bibleRVR1960) return 'The Bible is not loaded yet';

    //Declare Regular Expresions
    const versRegex: RegExp = /^([\dA-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/;
    const capRegex: RegExp = /^([\dA-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+)\s+(\d+)$/;

    let book = ''; //Deserved book
    let chapter = ''; //Deserved chapter
    let fromVerse = 0; //First verse
    let toVerse = 0; //Last verse

    let match: RegExpMatchArray | null;

    //Check if the verses requested are are the whole chapter or an interval
    if (match = verseReference.match(versRegex)) { //Verses
      //Split elements by match
      book = match[1];
      chapter = match[2];
      fromVerse = parseInt(match[3]);
      toVerse = match[4] ? parseInt(match[4]) : fromVerse;

    } else if (match = verseReference.match(capRegex)) { //Chapter
      //Split elements by match
      book = match[1];
      chapter = match[2];
      fromVerse = 1;

      const verses = this.bibleRVR1960[book.trim()]?.[chapter];
      if (!verses) return `Not found ${book} ${chapter}`;

      toVerse = Math.max(...Object.keys(verses).map(Number));

    } else {
      return 'Invalid reference';
    }

    const bookName = book.trim();
    const cap = this.bibleRVR1960[bookName]?.[chapter]; //Place chapter from Bible
    if (!cap) return `Not found ${bookName} ${chapter}`;

    let result = '';
    //Fetch verses from Book and Chapter
    for (let i = fromVerse; i <= toVerse; i++) {
      const texto = cap[i.toString()];
      if (texto) {
        result += `<span class="verseNumber">${i}</span> ${texto}\n`;
      }
    }

    return result.trim();
  }

  findInBible(term: string, includeAT: boolean = true, includeNT: boolean = true): VerseObject[] {
    if (term.length < 3) return [];

    const results: VerseObject[] = [];
    const normalicedTerm = this.normalizeText(term);

    const books = this.getFilteredBooks(includeAT, includeNT);

    if (books.length === 0) {
      return results; // Nothing selected
    }

    for (const book of books) {
      const chapters = this.bibleRVR1960[book];
      if (!chapters) continue; //If any book isn't on the bibleRVR1960 json

      for (const chapter in chapters) {
        const verses = chapters[chapter];

        for (const verse in verses) {
          const text = verses[verse];
          const normalizedText = this.normalizeText(text);

          if (normalizedText.includes(normalicedTerm)) {
            results.push({
              book,
              verse: `${book} ${chapter}:${verse}`,
              text
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Returns an array which has all the books from a Testament or both Testaments
   * @param includeAT 
   * @param includeNT 
   * @returns 
   */
  private getFilteredBooks(includeAT: boolean, includeNT: boolean) {
    let books: string[] = [];

    if (includeAT) {
      books = books.concat(Object.keys(this.bibleStructure["Antiguo Testamento"]));
    }

    if (includeNT) {
      books = books.concat(Object.keys(this.bibleStructure["Nuevo Testamento"]));
    }

    return books;
  }

  normalizeText(text: string): string {
    let normalized: string = ''
    if (text) {
      let formTitle = text.toLowerCase().normalize("NFD");
      normalized = formTitle.replace(/[\u0300-\u036f]/g, "");;
    }
    return normalized;
  }

  getFullChapterText(book: string, chapter: string, underlineFrom: number = 0, underlineTo: number = 0) {
    const chapterObj = this.bibleRVR1960?.[book]?.[chapter];
    const chapterSections = this.bibleTitles?.[book]?.[chapter];

    if (!chapterObj) {
      return null;
    }

    const verseNumbers = Object.keys(chapterObj).map(v => Number(v)).sort((a, b) => a - b);

    let result: string[] = [];

    for (let verseNum of verseNumbers) {      
      if (this.showBibleTittles) {
        // Check if there is any version that starts with that verse
        const section = chapterSections?.find((s: { desde: number; }) => s.desde === verseNum);
        if (section) {
          result.push(`<h4 class="sectionTitle">${section.titulo}</h4>`);
        }
      }
      
      //Undeline selected verses
      if (verseNum >= underlineFrom && verseNum <= underlineTo) {
        result.push(`<span class="verseNumber">${verseNum}</span> <span class="underlineVerse">${chapterObj[verseNum]}</span>`);
      } else {
        result.push(`<span class="verseNumber">${verseNum}</span> ${chapterObj[verseNum]}`);
      }
    }

    return result.join(" ");
  }


  getAdjacentChapter(currentBook: string, currentChapter: number, direction: 'next' | 'prev' = 'next'): string {
    // Array of all Bible books
    let allBooks: string[] = this.getAllBibleBooks();

    const currentIndex = allBooks.indexOf(currentBook);
    if (currentIndex === -1) return "Book not found";

    // NEXT BOOK
    if (direction === 'next') {
      const bookData = this.getBookData(currentBook);
      const totalChapters = Object.keys(bookData).length;

      if (currentChapter < totalChapters) { //Try to find on the next chapter
        return `${currentBook} ${currentChapter + 1}`;

      } else if (currentIndex < allBooks.length - 1) { //Try to find on the next book
        return `${allBooks[currentIndex + 1]} 1`;
      }

      return "";

      //PREVIOUS BOOK
    } else {
      if (currentChapter > 1) { //Try to find on the next chapter
        return `${currentBook} ${currentChapter - 1}`;

      } else if (currentIndex > 0) { //Try to find on the next chapter
        const prevBook = allBooks[currentIndex - 1];
        const prevBookData = this.getBookData(prevBook);
        const lastCapOfPrevBook = Object.keys(prevBookData).length;

        return `${prevBook} ${lastCapOfPrevBook}`;
      }

      return "";
    }
  }

  // Get all book Data
  private getBookData(bookName: string): any {
    const data = this.bibleStructure as any;

    for (const t in data) {
      if (data[t][bookName]) return data[t][bookName];
    }

    return {};
  }
}
