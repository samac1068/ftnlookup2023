import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
/*import { HttpClient } from "@angular/common";*/
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-gfmap-dash',
  templateUrl: './gfmap-dash.component.html',
  styleUrls: ['./gfmap-dash.component.css']
})
export class GfmapDashComponent implements OnInit {
  @Input() ftn_uic: string = "";

  gfmapTimeout: boolean = false;
  gfmapPodLoaded: boolean = false;
  gfmapNoRecords: boolean = true;

  private gridColumnApi: any ;
  private gridApi: any;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["GFMAP"] = [];
    this.gfmapPodLoaded = false;
    this.gfmapNoRecords = true;
    this.gfmapTimeout = false;
    this.ds.calculateColWidths("gfmap");
    this.ds.setColumnGlobals("gfmap");
    this.getPodData();
  }

  gfmapGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    let allColumnIds = [];
    this.gridColumnApi.getAllColumns().forEach(function (column: any) {
      allColumnIds.push(column.colId);
    });

    // Current disabled because it isn't adjusting to the appropriate column size.
    //this.gridColumnApi.autoSizeColumns(allColumnIds, false);
  }

  getPodData() {
    //Go out and get the information you need for this tab
    if(this.ds.tabs[this.ftn_uic]["GFMAP"].length == 0) {
      this.api.getGFMAP(this.ftn_uic).subscribe((results) => {
        if(results != null) {
          let grplst: any = {};

          for(let i=0; i < results.length; i++) {
            // Group data by ftn line number
            if(grplst[results[i].FTN_Line_No] == undefined) {
              grplst[results[i].FTN_Line_No] = {};
              grplst[results[i].FTN_Line_No]['data'] = [];
            }
            grplst[results[i].FTN_Line_No]['data'].push(results[i]);
          }

          // Moved the groups data into the appropriate array
          for(let obj in grplst) {
            this.ds.tabs[this.ftn_uic]["GFMAP"].push(grplst[obj]['data']);
          }
        }

        this.gfmapPodLoaded = true;
        this.gfmapNoRecords = (this.ds.tabs[this.ftn_uic]["GFMAP"].length == 0);
        this.conlog.log("gfmap has been loaded with data");
      });
    } else {
      this.gfmapPodLoaded = true;
      this.gfmapNoRecords = (this.ds.tabs[this.ftn_uic]["GFMAP"].length == 0);
      this.conlog.log("gfmap has been loaded with no data");
    }
  }
}
