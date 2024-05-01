import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Book, NewMessage, Speaker } from '../model/interfaces';

@Injectable({
  providedIn: 'root'
})
export class RestService {
  public bookList!: Book[]
  public speakerList!: Speaker[]
  constructor(private http: HttpClient) { }

  //SPEAKERS
  /**
   * 
   * @returns 
   */
  getAllSpeakers() {
    this.http.get(environment.url + environment.services.speaker).subscribe((data: any) => {
      this.speakerList = data.data
    })
  }

  //BOOKS
  /**
   * 
   */
  getAllBooks() {
    this.http.get(environment.url + environment.services.book).subscribe((data: any) => {
      this.bookList = data.data
    })
  }

  //MESSAGES
  /**
   * 
   * @returns 
   */
  getAllMessages() {
    return this.http.get(environment.url + environment.services.message);
  }

  /**
   * 
   * @param newMessage 
   * @returns 
   */
  addNewMessage(newMessage: NewMessage) {
    return this.http.post(environment.url + environment.services.message, newMessage);
  }
}
