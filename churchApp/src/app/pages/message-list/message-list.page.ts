import { Component, ViewChild } from '@angular/core';
import { Message, MessageFilterOpt } from '../../models/interfaces';
import { RestService } from '../../services/rest.service';
import { IonModal, LoadingController } from '@ionic/angular';
import { AppLauncher } from '@capacitor/app-launcher';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.page.html',
  styleUrls: ['./message-list.page.scss'],
})

export class MessageListPage {
  messageList!: Message[]
  isDesktop: boolean = false;
  filterForm!: FormGroup;
  datetime!: Date;
  @ViewChild(IonModal) modal!: IonModal;
  constructor(
              public restService: RestService,
              private loadingController: LoadingController,
              private formBuilder: FormBuilder
  ) { 
    this.filterForm = this.formBuilder.group({
      speaker: new FormControl(null),
      book: new FormControl(null),
      testament: new FormControl(null),
      dateFrom: new FormControl(null),
      dateTo: new FormControl(null),
    })
  }

  async ionViewWillEnter() {
    this.getAllMessages();
  }

  openUrl(targetUrl: string) {
    AppLauncher.openUrl({url: targetUrl})
  }

  async searchInput(event: any) {
    const query = event.target.value.toLowerCase();
    if(query && query != '' && query.length > 0) {
      let loading = await this.loadingController.create({
        message: 'Recuperando predicaciones...',
        cssClass: 'custom-loading',
        spinner: null,
      })
      loading.present();

      console.log('BUSQUEDA: ', query)
      this.restService.getMessagesByTitle(query).subscribe({
        next: (val: any) => {
          this.messageList = val.messageListMapped
        },
        error: (e) => {
          console.log('ERROR ', e)
        },
        complete: () => {
          loading.dismiss()
        }
      })
    }
  }

  async getAllMessages() {
    let loading = await this.loadingController.create({
      message: 'Recuperando predicaciones...',
      cssClass: 'custom-loading',
      spinner: null,
    })
    loading.present();
    console.log('ionViewWillEnter')
    this.restService.getAllMessages().subscribe((data: any) => {
      if(data) {
        this.messageList = data.messageListMapped
      }
      loading.dismiss()
    })
  }

  async searchFilter() {
      let loading = await this.loadingController.create({})
      loading.present();

      let filtrosBusqueda: MessageFilterOpt = this.filterForm.value
      

      // console.log('BUSQUEDA: ', this.removeNullUndefined(filtrosBusqueda))
      this.restService.getMessagesByFilterOptions(this.removeNullUndefined(filtrosBusqueda)).subscribe({
        next: (val: any) => {
          this.messageList = val.messageListMapped
        },
        error: (e) => {
          console.log('ERROR ', e)
        },
        complete: () => {
          this.resetFiltros();
          loading.dismiss()
        }
      })
    
  }

  removeNullUndefined(obj: any): any {
    return Object.keys(obj).reduce((acc, key) => {
      if (obj[key] !== null && obj[key] !== undefined) {
        acc[key] = obj[key];
      }
      return acc;
    }, {} as any);
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
    this.searchFilter();
  }

  resetFiltros() {
    this.filterForm.reset();
  }

  refresh(event: any) {
    this.restService.getAllMessages().subscribe((data: any) => {
      if(data) {
        this.messageList = data.messageListMapped
      }
      event.target.complete();
    })
  }

}
