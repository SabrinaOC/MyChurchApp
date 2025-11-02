import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Book, MessageFilterOpt } from 'src/app/models/interfaces';
import { CoreProvider } from 'src/app/services/core';
import { SimpleVerseSelectorComponent } from '../simple-verse-selector/simple-verse-selector.component';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.scss'],
})
export class FilterModalComponent {

  filterForm!: FormGroup;
  filteredBook: string = "";

  constructor(public core: CoreProvider, private formBuilder: FormBuilder) {
      this.filterForm = this.formBuilder.group({
        speaker: new FormControl(null),
        book: new FormControl(null),
        testament: new FormControl(null),
        dateFrom: new FormControl(null),
        dateTo: new FormControl(null),
      })
  }

  async searchFilter() {
      let loading = await this.core.loadingCtrl.create({
        message: 'Aplicando filtros...',
        cssClass: 'custom-loading',
        mode: 'md',
        spinner: null,
      })
      loading.present();

      let filtrosBusqueda: MessageFilterOpt = this.filterForm.value;

      this.core.api.message.findByFilter(this.removeNullUndefined(filtrosBusqueda))
      .subscribe({
        next: (val: any) => {
          this.core.modalCtrl.dismiss( val.messageListMapped, 'confirm');
        },
        error: (e) => {
          console.log('ERROR ', e)
        },
        complete: () => {
          this.resetFiltros();
          loading.dismiss();
        }
      });
  }

  cancel() {
    this.core.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.searchFilter();
  }

    removeNullUndefined(obj: any): any {
    return Object.keys(obj).reduce((acc, key) => {
      if (obj[key] !== null && obj[key] !== undefined) {
        acc[key] = obj[key];
      }
      return acc;
    }, {} as any);
  }

  resetFiltros() {
    this.filterForm.reset();
  }

  async showSimpleBookSelector(event: any) {
    event.preventDefault();

    const popover = await this.core.popoverCtrl.create({
      component: SimpleVerseSelectorComponent,
      translucent: true,
      cssClass: 'verse-selector-popover',
      componentProps: { justBook: true }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss<Book>();
    if (data) {
      console.log(data);
      this.filterForm.get('book')?.setValue(data.id);
      this.filteredBook = data.name;
    }
  }
}
