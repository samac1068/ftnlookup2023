import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-mdis-dash',
  templateUrl: './mdis-dash.component.html',
  styleUrls: ['./mdis-dash.component.css']
})
export class MdisDashComponent implements OnInit {
  @Input() ftn_uic: string;

  mdisNoRecords: boolean = true;
  mdisTabLoaded: boolean = false;
  mdisTimeout: boolean = false;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["MDIS"] = [];
    this.mdisNoRecords = true;
    this.mdisTabLoaded = false;
    this.ds.calculateColWidths("mdis");
    this.ds.setColumnGlobals("mdis");
    this.processTabContent();
  }

  processTabContent() {
    // Load this if we don't have any data
    if(this.ds.tabs[this.ftn_uic]["MDIS"].length == 0) {
      this.api.getFTNUICMDIS(this.ftn_uic).subscribe(result => {
        // Test for Timeout
        if (result != null && result.indexOf("Execution Timeout Expired") == -1) {
          // Need to adjust the date field
          for(let i =0; i < result.length; i++) {
            result[i].Mobdate = this.ds.setDateFormatFromString(new Date(result[i].Mobdate));
            result[i].Demobdate = this.ds.setDateFormatFromString(new Date(result[i].Demobdate));
            result[i].DEPLOYLAD = this.ds.setDateFormatFromString(new Date(result[i].DEPLOYLAD));
            result[i].REDEPLOYLAD = this.ds.setDateFormatFromString(new Date(result[i].REDEPLOYLAD));
          }

          this.ds.tabs[this.ftn_uic]["MDIS"] = result;
          this.mdisTimeout = false;
          this.completeMobProcess();
        } else {
          this.mdisTimeout = true;
          this.completeMobProcess();
        }
      });
    }
  }

  completeMobProcess() {
    // Display one of three items for this tab
    this.mdisTabLoaded = true;
    this.mdisNoRecords = (this.ds.tabs[this.ftn_uic]["MDIS"].length == 0);
    this.conlog.log("mdis has been loaded.");
  }
}
