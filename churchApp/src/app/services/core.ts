import { Injectable } from '@angular/core';
import { LoadingController, ModalController, NavController, PopoverController, ToastController } from '@ionic/angular';
import jsonBible from '../../assets/bible.json';
import { ApiService } from './api.service';
import { Book, MessageType, Speaker } from './api/models';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CoreProvider {
  public theme: 'dark' | 'light' = 'dark';

  messageTypeList: MessageType[] = [];
  speakerList: Speaker[] = [];
  bookList: Book[] = [];
  private bibleRVR1960: any;

  constructor(
    private http: HttpClient,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public popoverCtrl: PopoverController,
    public api: ApiService,
    public router: Router,
    public navCtrl: NavController,
    public loadingCtrl: LoadingController
  ) {
    this.loadBibleRVR1960()
  }

  public detectPrefersTheme() {
    let currentTheme: string | null = localStorage.getItem("theme");

    switch (currentTheme) {
      case 'dark':
        this.setDarkTheme();
        break;

      case 'light':
        this.setLightTheme();
        break;

      case null: //In the first time on the app, it will use default device theme
        const prefersDark: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');

        if (prefersDark.matches) {
          this.setDarkTheme();
        } else {
          this.setLightTheme();
        }
        break;
    }
  }

  private setLightTheme() {
    this.theme = 'light';
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem("theme", this.theme);
  }

  private setDarkTheme() {
    this.theme = 'dark';
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem("theme", this.theme);
  }

  public toggleTheme() {
    if (document.body.classList.contains('light-theme')) {
      this.setDarkTheme();
    } else {
      this.setLightTheme();
    }
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
      result += `[${i}] ${texto}\n`;
    }
  }

  return result.trim();
}

  normalizeText(text: string): string {
    let normalized: string = ''
    if(text) {
      let formTitle = text.toLowerCase()
      normalized = formTitle.replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u')
    }
    return normalized;
  }

  public async adviceToast(color: string, message: string) {
    await (await this.toastCtrl.create({
      message: message,
      duration: 4000,
      cssClass: 'productToast',
      color: color,
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel',
          handler: () => { this.toastCtrl.dismiss() }
        }
      ]
    })).present();
  }
}
