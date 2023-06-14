import { Component, OnInit, Input } from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-mob-dash',
  templateUrl: './mob-dash.component.html',
  styleUrls: ['./mob-dash.component.css']
})
export class MobDashComponent implements OnInit {
  @Input() ftn_uic: string;

  mobNoRecords: boolean = true;
  mobTabLoaded: boolean = false;
  mobTimeout: boolean = false;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["MOB"] = [];
    this.mobNoRecords = true;
    this.mobTabLoaded = false;

    // Modify Column Definition to include global settings
    this.ds.setColumnGlobals("mob");
    this.processTabContent();
  }

  processTabContent() {
    // Load this if we don't have any data
    if(this.ds.tabs[this.ftn_uic]["MOB"].length == 0) {
      this.api.getFTNUICMOB(this.ftn_uic)
        .subscribe(result => {
        // Test for Timeout
        if (result != null && result.indexOf("Execution Timeout Expired") == -1) {

          for(let i =0; i < result.length; i++) {
            result[i].MOB_DATE = this.ds.setDateFormatFromString(new Date(result[i].MOB_DATE));
            result[i].MSAD = this.ds.setDateFormatFromString(new Date(result[i].MSAD));
            result[i].DEMOB_DATE = this.ds.setDateFormatFromString(new Date(result[i].DEMOB_DATE));
          }

          this.ds.tabs[this.ftn_uic]["MOB"] = result;
          this.completeMobProcess();
        } else {
          //this.mobArr = [];
          this.mobTimeout = true;
          this.completeMobProcess();
        }
      });
    }
  }

  completeMobProcess() {
    // Display one of three items for this tab
    this.mobTabLoaded = true;
    this.mobNoRecords = (this.ds.tabs[this.ftn_uic]["MOB"].length == 0);
    this.conlog.log("mob has been loaded.");
  }
}
