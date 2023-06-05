import { Component, OnInit } from '@angular/core';
import { DatastoreService } from '../../services/datastore.service';
import { ConfirmDialogService } from 'src/app/dialogs/confirm-dialog/confirm-dialog.service';
import {ConlogService} from '../../modules/conlog/conlog.service';
import {CommService} from '../../services/comm.service';

@Component({
  selector: 'app-tabcontainer',
  templateUrl: './tabcontainer.component.html',
  styleUrls: ['./tabcontainer.component.css']
})
export class TabcontainerComponent implements OnInit {

  selected: number = 0;
  titleText: string = "";
  tabArr: any = [];

  constructor(private ds:DatastoreService, private cds: ConfirmDialogService, private conlog: ConlogService, private comm: CommService) { }

  ngOnInit() {
    // Emit Listeners
    this.comm.openNewTab
    .subscribe(evt => {
      // Add the value to the tabs array
      evt.index = this.ds.tabs.length;
      this.ds.tabs[evt.ftn_uic] = {};
      this.ds.tabs[evt.ftn_uic] = evt;

      // Add the pod
      this.addAPod(evt.ftn_uic);
    });

    //Determine which set of tabs we should be using
    if(typeof(this.ds.tabs) == undefined) {
      this.cds.acknowledge('Fatal Error', 'Unauthorized access gained. Operation Aborted', 'OK');
     } else {
      this.generatePodArr();
     }
  }

  generatePodArr() {
    for(let val in this.ds.tabs) {
      this.conlog.log("Adding tab for: " + val);
      this.tabArr.push(val);
    }
  }

  setValue(evt: any) {
    this.selected = evt;
  }

  addAPod(val: string) {
    this.tabArr.push(val);
  }
}
