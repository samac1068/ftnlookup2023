import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-samas-dash',
  templateUrl: './samas-dash.component.html',
  styleUrls: ['./samas-dash.component.css']
})
export class SamasDashComponent implements OnInit {
  @Input() ftn_uic: string;

  samasNoRecords: boolean = true;
  samasTabLoaded: boolean = false;
  samasTimeout: boolean = false;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["SAMAS"] = [];
    this.samasNoRecords = true;
    this.samasTabLoaded = false;

    // Modify Column Definition to include global settings
    this.ds.setColumnGlobals("samas");
    this.processTabContent();
  }

  processTabContent() {
    if(this.ds.tabs[this.ftn_uic]["SAMAS"].length == 0) {
      this.api.getSAMAS(this.ftn_uic)
        .subscribe( results => {
          // Test for Timeout
          if (results != null && results.indexOf("Execution Timeout Expired") == -1) {
            this.ds.tabs[this.ftn_uic]["SAMAS"] = results;
            this.completeSAMASProcess();
          } else {
            //this.mobArr = [];
            this.samasTimeout = true;
            this.completeSAMASProcess();
          }
        });
    }
  }

  completeSAMASProcess() {
    this.samasTabLoaded = true;
    this.samasNoRecords = (this.ds.tabs[this.ftn_uic]["SAMAS"].length == 0);
    this.conlog.log("samas has been loaded.");
  }

}
