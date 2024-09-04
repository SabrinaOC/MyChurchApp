import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Message } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';

@Component({
  selector: 'app-mini-audio-player',
  templateUrl: './mini-audio-player.component.html',
  styleUrls: ['./mini-audio-player.component.scss'],
})
export class MiniAudioPlayerComponent implements OnInit {
  @Input() public message!: Message;
  @Output() public closing: EventEmitter<any> = new EventEmitter();
  @ViewChild("audioPlayer") audioPlayer!: ElementRef<HTMLElement>;

  constructor(public core: CoreProvider, public sanitizer: DomSanitizer) { }

  ngOnInit() {
    console.log("Hoola");
  }

  closeAudioPlayer() {
    this.audioPlayer.nativeElement.classList.add("disappearAudioPlayer");
    this.audioPlayer.nativeElement.classList.remove("appearAudioPlayer");

    setTimeout(() => {
      this.closing.emit();
    }, 700); //This time must match with the "disappearAudioPlayerAnimation" time
  }
}
