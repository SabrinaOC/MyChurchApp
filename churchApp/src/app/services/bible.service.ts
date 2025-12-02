import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import jsonBible from '../../assets/bible.json';

@Injectable({
  providedIn: 'root'
})
export class BibleService {

  private bibleRVR1960: any;
  private bibleTitles: any;

  public showBibleTittles: boolean = true;

  constructor(private http: HttpClient) {
    this.loadBibleRVR1960();
  }


  public getAllBibleBooks(): string[] {
    let books: string[] = Object.keys(jsonBible['Antiguo Testamento']).concat(Object.keys(jsonBible['Nuevo Testamento']))

    return books;
  }

  public getChapterCount(bookName: string): number | null {
    for (const testament of Object.values(jsonBible)) {
      if (bookName in testament) {
        const chapters = Object.keys((testament as any)[bookName]);
        return chapters.length;
      }
    }
    return null; // Not found book
  }

  public getVerses(bookName: string, chapter: number): number | null {
    for (const testament of Object.values(jsonBible)) {
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

    for (const testament of Object.values(jsonBible)) {
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

  findInBible(term: string, includeAT: boolean = true, includeNT: boolean = true) {
    if (term.length < 3) return [];

    const results: any[] = [];
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
      books = books.concat(Object.keys(jsonBible["Antiguo Testamento"]));
    }

    if (includeNT) {
      books = books.concat(Object.keys(jsonBible["Nuevo Testamento"]));
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

  getFullChapterText(book: string, chapter: string) {
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

      result.push(`<span class="verseNumber">${verseNum}</span> ${chapterObj[verseNum]}`);
    }

    return result.join(" ");
  }
}
