import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestService } from '../services/rest.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  speakerList!: any
  constructor(
              private restService: RestService
  ) {}

  ngOnInit() {
    console.log('PARAMS => ', this.activatedRoute.snapshot.params)
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
    this.getAllSpeakers()
  }

  getAllSpeakers() {
    this.restService.getAllSpeakers().subscribe(res => {
      console.log('GET ALL SPEAKERS => ', res)
      if(res) {
        this.speakerList = res;
      }
    })
  }
}
