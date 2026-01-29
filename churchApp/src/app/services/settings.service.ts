import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  public theme: 'dark' | 'light' = 'dark';
  public showBibleTittles: boolean = true;
  public showBibleBackgroundColor: boolean = true;
  public bibleFont: 'sans-serif' | 'serif' = 'serif';

  constructor() { }

  /**
   * Read saved settings
   */
  public loadSettings() {
    this.detectPrefersTheme();
    this.detectPrefersShowBibleTitles();
    this.detectPrefersShowBibleBackgroundColor();
    this.detectPrefersBibleFont();
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

  public toggleBibleTitles() {
    this.showBibleTittles = !this.showBibleTittles;
    localStorage.setItem("bibleTitles", this.showBibleTittles + "");
  }

  public toggleBibleBackgroundColor() {
    this.showBibleBackgroundColor = !this.showBibleBackgroundColor;
    localStorage.setItem("bibleBackgroundColor", this.showBibleBackgroundColor + "");
  }

  public toggleBibleFont(font: 'sans-serif' | 'serif') {
    this.bibleFont = font;
    localStorage.setItem("bibleFont", this.bibleFont);
  }

  private detectPrefersTheme() {
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

  private detectPrefersShowBibleTitles() {
    let prefersBibleTitles: string | null = localStorage.getItem("bibleTitles")

    switch (prefersBibleTitles) {
      case 'true':
        this.showBibleTittles = true;
        break;
      case 'false':
        this.showBibleTittles = false;
        break;
      case null:
        this.showBibleTittles = true;
        break;
    }
  }

  private detectPrefersShowBibleBackgroundColor() {
    let prefersBibleBackgroundColor: string | null = localStorage.getItem("bibleBackgroundColor")

    switch (prefersBibleBackgroundColor) {
      case 'true':
        this.showBibleBackgroundColor = true;
        break;
      case 'false':
        this.showBibleBackgroundColor = false;
        break;
      case null:
        this.showBibleBackgroundColor = true;
        break;
    }
  }

  private detectPrefersBibleFont() {
    let prefersBibleFont: string | null = localStorage.getItem("bibleFont")

    switch (prefersBibleFont) {
      case 'sans-serif':
        this.bibleFont = 'sans-serif';
        break;
      case 'serif':
        this.bibleFont = 'serif';
        break;
      case null:
        this.bibleFont = 'serif';
        break;
    }
  }
}
