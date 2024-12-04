import { Injectable } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class CoreProvider {
  public theme: 'dark' | 'light' = 'dark';

  constructor(public modalCtrl: ModalController) { }

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

}
