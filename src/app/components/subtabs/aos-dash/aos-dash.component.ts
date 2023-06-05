import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-aos-dash',
  templateUrl: './aos-dash.component.html',
  styleUrls: ['./aos-dash.component.css']
})
export class AosDashComponent implements OnInit {
  @Input() ftn_uic: string;

  aosNoRecords: boolean = true;
  aosTabLoaded: boolean = false;
  aosTimeout: boolean = false;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["AOS"] = [];
    this.aosNoRecords = true;
    this.aosTabLoaded = false;

    // Modify Column Definition to include global settings
    this.ds.setColumnGlobals("aos");
    this.processTabContent();
  }

  processTabContent() {
    if(this.ds.tabs[this.ftn_uic]["AOS"].length == 0) {
      this.api.getAOSByUIC(this.ftn_uic)
        .subscribe( results => {
          // Test for Timeout
          if (results != null && results.indexOf("Execution Timeout Expired") == -1) {
            this.ds.tabs[this.ftn_uic]["AOS"] = results;
            this.completeAOSProcess();
          } else {
            //this.mobArr = [];
            this.aosTimeout = true;
            this.completeAOSProcess();
          }
        });
    }
  }

  completeAOSProcess() {
    this.aosTabLoaded = true;
    this.aosNoRecords = (this.ds.tabs[this.ftn_uic]["AOS"].length == 0);
    this.conlog.log("aos has been loaded.");
  }
}
