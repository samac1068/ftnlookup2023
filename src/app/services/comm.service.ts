import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommService {
  orderLoadedEmit = new EventEmitter();   // Emitted when the Orders Information is loaded.
  podActivated = new EventEmitter();      // Used to alert when a pod is selected
  openNewTab = new EventEmitter<any>();
  exportToExcel = new EventEmitter();     // Used to execute the export to excel function
}
