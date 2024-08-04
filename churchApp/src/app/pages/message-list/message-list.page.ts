import { Component, ViewChild } from '@angular/core';
import { Message, MessageFilterOpt } from '../../models/interfaces';
import { RestService } from '../../services/rest.service';
import { IonModal, LoadingController } from '@ionic/angular';
import { AppLauncher } from '@capacitor/app-launcher';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Share } from '@capacitor/share';
import * as _ from 'lodash';

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
  rbSelected: string = 'all';
  backupListForRbFilter!: Message[];
  searchQuery: string = '';
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
          this.updateMessageList(val.messageListMapped)
          this.rbSelection(this.rbSelected)
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
        this.updateMessageList(data.messageListMapped)
      }
      // loading.dismiss()
    })
  }

  async searchFilter() {
      let loading = await this.loadingController.create({
        message: 'Aplicando filtros...',
        cssClass: 'custom-loading',
        spinner: null,
      })
      loading.present();

      let filtrosBusqueda: MessageFilterOpt = this.filterForm.value
      

      // console.log('BUSQUEDA: ', this.removeNullUndefined(filtrosBusqueda))
      this.restService.getMessagesByFilterOptions(this.removeNullUndefined(filtrosBusqueda)).subscribe({
        next: (val: any) => {
          this.updateMessageList(val.messageListMapped)
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
        this.updateMessageList(data.messageListMapped)
      }
      event.target.complete();
    })
  }

  markAsListened(message: Message, event: any) {
    event.stopPropagation()
    //localStorage to track lilstened messages
    let listened = localStorage.getItem('listened');
    // console.log('listened => ', listened)
    if(listened === null) {
      localStorage.setItem('listened', `${message.id}`)
    } else {
      listened += `, ${message.id}`
      localStorage.setItem('listened', listened)

    }
    
    this.updateMessageList(this.messageList)
  }

  removeFromListened(message: Message, event: any) {
    event.stopPropagation()
    let listened = localStorage.getItem('listened');
    let arr1 = listened?.split(',')
    let arr = [...new Set(arr1)]
    const removed = arr.filter(element => parseInt(element) !== message.id);

    localStorage.setItem('listened', removed.toString())

    this.resetListenedBeforeMark()
    this.checkIfAlreadyListened()
  }

  checkIfAlreadyListened() {
    let listened = localStorage.getItem('listened');
    
    let arr1 = listened?.split(',')
    let arr = [...new Set(arr1)]
    // console.log('localStorage : ', arr)
    this.messageList.forEach((message: Message )=> {
        arr?.forEach(element => {
          // console.log('element => ', element, '\tMessage => ', message.id)
          if(parseInt(element) === message.id) {
            // console.log('COINCIDENCIAAAAAAAAAAAAAAAAAAAAAAAA')
            message.listened = true;
          }
        })
    })

    if(this.rbSelected === 'all') {
      this.backupListForRbFilter = _.cloneDeep(this.messageList);
    }
  }

  /**
   * Función centralizada para gestionar actualización de la lista de predicaciones mostradas
   */
  updateMessageList(lista: any) {
    this.messageList = lista;
    this.checkIfAlreadyListened()
  }

  resetListenedBeforeMark() {
    this.messageList.forEach(msg => {
      msg.listened = false;
    })
  }

  async shareMessage(message: Message, event: any) {
    event.stopPropagation()

    await Share.share({
      title: `${message.title}`,
      text: `*${message.title}*. Te invito a escuchar esta predicación`,
      url: `${message.url}`,
      // dialogTitle: `${message.title}`,
    });
  }

  rbSelection(event: any) {
    this.rbSelected = event.target.value

    // actualizamos lista con este filtro
    if(this.rbSelected === 'all') {
      this.messageList = this.backupListForRbFilter;
    } else if (this.rbSelected === 'listened') {
      this.messageList = this.backupListForRbFilter.filter(msg => msg.listened && msg.listened === true)
    } else if (this.rbSelected === 'pending') {
      this.messageList = this.backupListForRbFilter.filter(msg => !(msg.listened && msg.listened === true))
    }

    //actualizamos visualizacion de lista
    this.updateMessageList(this.messageList)
  }
}
