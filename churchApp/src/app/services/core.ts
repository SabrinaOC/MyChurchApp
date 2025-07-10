import { Injectable } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import jsonBible from '../../assets/bible.json'
import { ApiService } from './api.service';
import { Book, MessageType, Speaker } from './api/models';

@Injectable({
  providedIn: 'root'
})
export class CoreProvider {
  public theme: 'dark' | 'light' = 'dark';

  messageTypeList: MessageType[] = [];
  speakerList: Speaker[] = [];
  bookList: Book[] = []

  constructor(
    public modalCtrl: ModalController,
    public toastCtrl: ToastController,
    public api: ApiService
  ) { }

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
