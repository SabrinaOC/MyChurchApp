import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NewMessage } from '../model/interfaces';

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(private http: HttpClient) { }

  getAllSpeakers() {
    return this.http.get(environment.url + environment.services.speaker);
  }

  addNewMessage(newMessage: NewMessage) {
    return this.http.post(environment.url + environment.services.message, newMessage)
  }
}
