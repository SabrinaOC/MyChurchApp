import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Message } from 'src/app/models/interfaces';

@Component({
  selector: 'app-message-detail',
  templateUrl: './message-detail.page.html',
  styleUrls: ['./message-detail.page.scss'],
})
export class MessageDetailPage implements OnInit {

  msgSelected!: Message;

  constructor(
    public navCtrl: NavController,
    private router: Router
  ) { }

  ngOnInit() {
    this.getMessageDetail();
  }

  getMessageDetail() {
    this.msgSelected = this.router.getCurrentNavigation()?.extras.queryParams as Message
  }
}
