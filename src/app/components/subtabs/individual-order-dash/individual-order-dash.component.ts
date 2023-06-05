import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-individual-order-dash',
  templateUrl: './individual-order-dash.component.html',
  styleUrls: ['./individual-order-dash.component.css']
})
export class IndividualOrderDashComponent implements OnInit {
  @Input() ftn_uic: string = "";

  indordNoRecords: boolean = true;
  indordTabLoaded: boolean = false;
  indordTimeout: boolean = false;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["INDORD"] = [];
    this.indordNoRecords = true;
    this.indordTabLoaded = false;

    // Modify Column Definition to include global settings
    this.ds.setColumnGlobals("indord");
    this.processTabContent();
  }

  processTabContent() {
    if(this.ds.tabs[this.ftn_uic]["INDORD"].length == 0) {
      if(this.ds.tabs[this.ftn_uic].type == 'ftn')
        this.api.getIndividualByFTN(this.ftn_uic).subscribe(results => { this.handleAPIResults(results); });
      else
        this.api.getIndividualByUIC(this.ftn_uic).subscribe(results => { this.handleAPIResults(results); });
    }
  }

  handleAPIResults(results: any) {
    if (results != null && results.indexOf("Execution Timeout Expired") == -1) {
      this.ds.tabs[this.ftn_uic]["INDORD"] = results;
      this.completeINDORDProcess();
    } else {
      this.indordTimeout = true;
      this.completeINDORDProcess();
    }
  }

  completeINDORDProcess() {
    this.indordTabLoaded = true;
    this.indordNoRecords = (this.ds.tabs[this.ftn_uic]["INDORD"].length == 0);
    this.conlog.log("individual orders has been loaded.");
  }
}
