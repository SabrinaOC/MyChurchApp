import { Component, Input, OnInit } from '@angular/core';
import { Message } from 'src/app/models/interfaces';

@Component({
  selector: 'app-mini-audio-player',
  templateUrl: './mini-audio-player.component.html',
  styleUrls: ['./mini-audio-player.component.scss'],
})
export class MiniAudioPlayerComponent  implements OnInit {
  @Input() public message!: Message;

  constructor() { }

  ngOnInit() {
    console.log("Hoola");
    
  }

}
