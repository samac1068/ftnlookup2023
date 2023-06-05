import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-drrsa-dash',
  templateUrl: './drrsa-dash.component.html',
  styleUrls: ['./drrsa-dash.component.css']
})
export class DrrsaDashComponent implements OnInit {
  @Input() ftn_uic: string;

  drrsaNoRecords: boolean = true;
  drrsaTabLoaded: boolean = false;
  drrsaTimeout: boolean = false;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["DRRSA"] = [];
    this.drrsaNoRecords = true;
    this.drrsaTabLoaded = false;

    // Modify Column Definition to include global settings
    this.ds.setColumnGlobals("drrsa");
    this.processTabContent();
  }

  processTabContent() {
    if(this.ds.tabs[this.ftn_uic]["DRRSA"].length == 0) {
      this.api.getDRRSA(this.ftn_uic)
        .subscribe( results => {
          // Test for Timeout
          if (results != null && results.indexOf("Execution Timeout Expired") == -1) {
            this.ds.tabs[this.ftn_uic]["DRRSA"] = results;
            this.completeDRRSAProcess();
          } else {
            //this.mobArr = [];
            this.drrsaTimeout = true;
            this.completeDRRSAProcess();
          }
        });
    }
  }

  completeDRRSAProcess() {
    this.drrsaTabLoaded = true;
    this.drrsaNoRecords = (this.ds.tabs[this.ftn_uic]["DRRSA"].length == 0);
    this.conlog.log("drrsa has been loaded.");
  }
}
