import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-fmsweb-dash',
  templateUrl: './fmsweb-dash.component.html',
  styleUrls: ['./fmsweb-dash.component.css']
})
export class FmswebDashComponent implements OnInit {
  @Input() ftn_uic: string;

  fmswebNoRecords: boolean = true;
  fmswebTabLoaded: boolean = false;
  fmswebTimeout: boolean = false;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["FMSWEB"] = [];
    this.fmswebNoRecords = true;
    this.fmswebTabLoaded = false;

    // Modify Column Definition to include global settings
    this.ds.setColumnGlobals("fmsweb");
    this.processTabContent();
  }

  processTabContent() {
    if(this.ds.tabs[this.ftn_uic]["FMSWEB"].length == 0) {
      this.api.getFMSWeb(this.ftn_uic)
        .subscribe( results => {
          // Test for Timeout
          if (results != null && results.indexOf("Execution Timeout Expired") == -1) {
            this.ds.tabs[this.ftn_uic]["FMSWEB"] = results;
            this.completeFMSWEBAProcess();
          } else {
            //this.mobArr = [];
            this.fmswebTimeout = true;
            this.completeFMSWEBAProcess();
          }
        });
    }
  }

  completeFMSWEBAProcess() {
    this.fmswebTabLoaded = true;
    this.fmswebNoRecords = (this.ds.tabs[this.ftn_uic]["FMSWEB"].length == 0);
    this.conlog.log("fmsweb has been loaded.");
  }
}
