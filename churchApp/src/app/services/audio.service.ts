import { Injectable, OnDestroy } from '@angular/core';
import { Message } from '../models/interfaces';
import * as Constants from 'src/app/constants';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AudioService implements OnDestroy {
  private listenedObs = new Subject<string | null>();
  listened = this.listenedObs.asObservable();

  selectedMessage: Message | null = null;

  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private progressSubject = new BehaviorSubject<number>(0);
  private durationSubject = new BehaviorSubject<number>(0);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);

  isPlaying$ = this.isPlayingSubject.asObservable();
  progress$ = this.progressSubject.asObservable();
  duration$ = this.durationSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();

  private audio = new Audio();

  constructor() {
    this.audio.addEventListener('timeupdate', () => {
      this.progressSubject.next(this.audio.currentTime);
    });
    this.audio.addEventListener('loadedmetadata', () => {
      this.durationSubject.next(this.audio.duration);
    });
    this.audio.addEventListener('play', () => this.isPlayingSubject.next(true));
    this.audio.addEventListener('pause', () => this.isPlayingSubject.next(false));
    this.audio.addEventListener("loadstart", () => { this.isLoadingSubject.next(this.selectedMessage !== null); });
    this.audio.addEventListener("loadeddata", () => { this.isLoadingSubject.next(false); });
    // this.audio.addEventListener("seeking", () => this.isLoadingSubject.next(true));
    // this.audio.addEventListener("seeked", () => this.isLoadingSubject.next(false));
    this.audio.addEventListener('ended', (event) => this.markAsListened(this.selectedMessage!, event));
  }

  ngOnDestroy(): void {
    // Liberar la URL generada para evitar fugas de memoria
    if (this.audio.src) {
      URL.revokeObjectURL(this.audio.src);
    }
  }

  loadAudio() {   
    if(this.selectedMessage) {
      const url = `${environment.url}/audioFiles?url=${this.selectedMessage.url}&title=${this.selectedMessage.title}&mimetype=${this.selectedMessage.mimetype}`;
      
      this.audio.src = url;
      this.audio.load();

      this.audio.play();
    }
  }

  selectMessage(message: Message | null) {
    if (message?.id === this.selectedMessage?.id) return

    if (message === null) {
      this.isPlayingSubject.next(false);      
      this.isLoadingSubject.next(false);
      
      this.audio.src = "";
      this.audio.pause();
    }
    this.progressSubject.next(0);
    this.durationSubject.next(0);

    this.selectedMessage = message;
    localStorage.setItem(Constants.AUDIO_FILE_ID, '' + this.selectedMessage?.id);

    this.loadAudio();
  }

  markAsListened(message: Message, event: any) {
    event?.stopPropagation()
    //localStorage to track lilstened messages
    let listened = localStorage.getItem('listened');
    if (listened === null) {
      localStorage.setItem('listened', `${message.id}`);
    } else {
      listened += `, ${message.id}`
      localStorage.setItem('listened', listened);
    }

    this.listenedObs.next(listened);
  }

  play() { this.audio.play(); }
  pause() { this.audio.pause(); }
  seekTo(seconds: number) { this.audio.currentTime = seconds; }
}
