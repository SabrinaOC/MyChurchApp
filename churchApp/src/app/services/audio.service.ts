import { ChangeDetectorRef, Injectable } from '@angular/core';
import { Message } from '../models/interfaces';
import * as Constants from 'src/app/constants';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private listenedObs = new Subject<string | null>();
  listened = this.listenedObs.asObservable();

  selectedMessage: Message | null = null;

  constructor() { }

  selectMessage(message: Message | null) {
    this.selectedMessage = message;
    localStorage.setItem(Constants.AUDIO_FILE_ID, '' + this.selectedMessage?.id)
  }

  markAsListened(message: Message, event: any) {
    event?.stopPropagation()
    //localStorage to track lilstened messages
    let listened = localStorage.getItem('listened');
    if (listened === null) {
      localStorage.setItem('listened', `${message.id}`)
    } else {
      listened += `, ${message.id}`
      localStorage.setItem('listened', listened)

    }

    this.listenedObs.next(listened);
  }
}
