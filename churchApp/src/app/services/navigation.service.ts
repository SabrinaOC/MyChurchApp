import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private history: string[] = [];

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // Guardamos la ruta actual en el historial
        this.history.push(event.urlAfterRedirects);
      });
  }

  public getPreviousUrl(): string {
    // El índice [length - 1] es la página actual
    // El índice [length - 2] es la página anterior
    return this.history.length > 1 ? this.history[this.history.length - 2] : '';
  }
}
