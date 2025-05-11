import { Injectable } from '@angular/core';
import { AudioFileService, BookService, MessageService, SpeakerService, MessageTypesService } from './api/services';
import { MessageType } from './api/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    public audio: AudioFileService,
    public book: BookService,
    public message: MessageService,
    public messageType: MessageTypesService,
    public speaker: SpeakerService
  ) { }
}
