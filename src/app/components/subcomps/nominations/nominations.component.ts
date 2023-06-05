import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-nominations',
  templateUrl: './nominations.component.html',
  styleUrls: ['./nominations.component.css']
})
export class NominationsComponent implements OnInit {
  @Input() ftn_uic: string = "";
  @Input() podtype: string = "";

  podData: any;
  hasData: boolean = false;
  podWidth: number = -1;

  constructor(private ds: DatastoreService, private comm: CommService, private conlog: ConlogService) { }

  ngOnInit(): void {
    // Set up communications
    this.comm.podActivated.subscribe(evt => {
        if(evt){
          this.podWidth = this.ds.windowDims.width * .98;
        } else {
          this.podWidth = this.ds.podDims.width - 5;
        }
    });

    this.podData = (this.podtype == "fpnom") ? this.ds.tabs[this.ftn_uic]["JCRMFPNoms"] : this.ds.tabs[this.ftn_uic]["JCRMJFPNoms"];
    this.hasData = (this.podData != undefined);
    this.podWidth = this.ds.podDims.width - 5;

    this.conlog.log("subtab: nomination " + this.podtype + "  - loaded");
  }

  setCellBGColor(value: any): string {
    if(value != null) {
      switch (value.toUpperCase()) {
        case "GREEN":
        case "LOW":
          return "cell_green";
        case "YELLOW":
        case "MODERATE":
          return "cell_yellow";
        case "RED":
        case "HIGH":
          return "cell_red";
        case "ORANGE":
        case "SIGNIFICANT":
          return "cell_orange";
        default:
          return "cell_none";
      }
    }
    return "cell_none";
  }
}
