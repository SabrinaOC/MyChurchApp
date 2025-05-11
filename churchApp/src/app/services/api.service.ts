import { Injectable } from '@angular/core';
import { AudioFileService, BookService, MessageService, SpeakerService } from './api/services';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    public audio: AudioFileService,
    public book: BookService,
    public message: MessageService,
    public messageType: MessageService,
    public speaker: SpeakerService
  ) { }
}
