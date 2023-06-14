import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {WebapiService} from '../../../services/webapi.service';
import {CommService} from '../../../services/comm.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-itap-dash',
  templateUrl: './itap-dash.component.html',
  styleUrls: ['./itap-dash.component.css']
})
export class ItapDashComponent implements OnInit {
  @Input() ftn_uic: string;
  userInfoText: string
  userOrderInfo: string = "No ITAP Data Found";
  uicStr: string;
  columnDefs: any = [];

  itapLoaded: boolean = false;
  itapTimeout: boolean = false;
  itapNoRecords: boolean = true;

  gridStatus: boolean = false;

  localTimer: any;

  constructor(public ds: DatastoreService, private api: WebapiService, private comm: CommService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["ITAP"] = [];
    this.ds.tabs[this.ftn_uic]["ITAP"]["ORDER_LIST"] = [];
    this.ds.tabs[this.ftn_uic]["ITAP"]["DATA"] = [];
    this.ds.tabs[this.ftn_uic]["ITAP"]["UICS"] = [];

    this.userInfoText = "Stand-By, waiting for results from ORDERS tab.";
    this.ds.calculateColWidths("itap");
    this.ds.setColumnGlobals("itap");

    if(this.ds.tabs[this.ftn_uic].ordersTabLoaded)
      this.dataEvaluation();
    else
      this.waitForOrdersToLoad();  // Need to wait until ordersTabLoaded is true
  }

  waitForOrdersToLoad() {
    this.localTimer = setInterval(this.evaluateItapDataLoad.bind(this), 1000); // Need to wait until ordersTabLoaded is true
  }

  evaluateItapDataLoad() {
    if(this.ds.tabs[this.ftn_uic].ordersTabLoaded){
      clearTimeout(this.localTimer);
      this.dataEvaluation();
    }
  }

  dataEvaluation() {
    if(this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][0] != undefined && this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] != 'Execution Timeout Expired') {
      this.userInfoText = "Stand-by, Loading ITAP Data.";
      this.getItapData();
    } else {
      this.completeTab();
    }
  }

  getItapData() {
    for (let u = 0; u < this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length; u++) {
      let uic: string = this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][u]["urf_uic"];

      if(!this.ds.searchArrFor(uic, this.ds.tabs[this.ftn_uic]["ITAP"]["ORDER_LIST"]))
        this.ds.tabs[this.ftn_uic]["ITAP"]["ORDER_LIST"].push(uic);
    }

    // Combine the UIC into a single string
    this.uicStr = this.ds.tabs[this.ftn_uic]["ITAP"]["ORDER_LIST"].join();

    // Get ITAP data
    this.api.getITAPStr(this.uicStr)
      .subscribe(result => {
        this.itapTimeout = result.indexOf("Execution Timeout Expired") > -1;
        let itapList = {};

        // Need to properly sort the information by UICs
        if(!this.itapTimeout){
          for(let a = 0; a < result.length; a++) {
            if(itapList[result[a].CURR_UIC] == undefined) {
              itapList[result[a].CURR_UIC] = [];
              this.ds.tabs[this.ftn_uic]["ITAP"]["UICS"].push(result[a].CURR_UIC);
            }

            itapList[result[a].CURR_UIC].push(result[a]);
          }
        }

        this.ds.tabs[this.ftn_uic]["ITAP"]["DATA"] = (this.itapTimeout) ? result : itapList;
        this.completeTab();
      })
  }

  completeTab() {
    /*if(this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] == "Execution Timeout Expired") {
      //if (this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][0] == undefined) this.userOrderInfo = "ORDERS Timed out.";
      //else
      this.userOrderInfo = "No ORDERS records available.";
    }*/

    this.itapNoRecords = this.ds.tabs[this.ftn_uic]["ITAP"]["UICS"].length == 0;
    this.itapLoaded = true;
    this.conlog.log("itap has been loaded.");
  }

  gridClickEvent(){
    this.gridStatus = !this.gridStatus;
  }
}
