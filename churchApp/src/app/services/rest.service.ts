import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Book, Message, MessageType, NewMessage, Speaker } from '../models/interfaces';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RestService {
  
  constructor(private http: HttpClient) {}

  //SPEAKERS
  /**
   *
   * @returns
   */
  // getAllSpeakers() {
  //   this.http
  //     .get(environment.url + environment.services.speaker)
  //     .subscribe((data: any) => {
  //       this.speakerList = data.speakerList;
  //     });
  // }

  //BOOKS
  /**
   *
   */
  // getAllBooks() {
  //   this.http
  //     .get(environment.url + '/books')
  //     .subscribe((data: any) => {
  //       this.bookList = data.bookList;
  //     });
  // }
  
  //MESSAGE TYPES
  /**
   * 
   * @returns 
   */
  // getAllMessageTypes() {
  //   this.http.get(environment.url + environment.services.messageTypes).subscribe((data: any) => {
  //     this.messageTypeList = data.messageTypeList;
  //   });
  // }

  //MESSAGES
  /**
   *
   * @returns
   */
  // getAllMessages() {
  //   return this.http.get(environment.url + environment.services.messages.message);
  // }

  /**
   * 
   * @param searchedTitle 
   * @returns 
   */
  // getMessagesByTitle(searchedTitle: string) {
  //   return this.http.get(environment.url + environment.services.messages.findByTitle, {params: {searchedTitle}}, );
  // }

  /**
   * 
   * @param params 
   * @returns 
   */
  // getMessagesByFilterOptions(params: any) {
  //   let httpParams = new HttpParams();
  //   for (const key in params) {
  //     if (params.hasOwnProperty(key)) {
  //       httpParams = httpParams.set(key, params[key]);
  //     }
  //   }
  //   return this.http.get(environment.url + environment.services.messages.filter, {params: httpParams});
  // }

  /**
   *
   * @param newMessage
   * @returns
   */
  // addNewMessage(newMessage: NewMessage): Observable<any> {
  //   return this.http
  //     .post(environment.url + environment.services.messages.message, newMessage)
  // }

  /**
   *
   * @param newMessage
   * @returns
   */
  // updateMessage(newMessage: NewMessage): Observable<any> {
  //   return this.http
  //     .put(environment.url + environment.services.messages.message, newMessage)
  // }

  /**
   *
   * @param idMsg
   * @returns
   */
  // deleteMessage(idMsg: number): Observable<any> {
  //   return this.http
  //     .delete(environment.url + environment.services.messages.message, { body: { id: idMsg} })
  // }

  /**
   * 
   * @param msg 
   * @returns 
   */
  downloadAudioFile(msg: Message): Observable<Blob> {
    return this.http
      .get(environment.url + '/audioFiles', {
        headers: { 'Accept': 'audio/mpeg' },
        responseType: 'blob',
        params: { url: msg.url, title: msg.title, mimetype: msg.mimetype}
      })
  }
}
