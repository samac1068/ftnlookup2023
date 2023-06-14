import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-orders-dash',
  templateUrl: './orders-dash.component.html',
  styleUrls: ['./orders-dash.component.css']
})
export class OrdersDashComponent implements OnInit {
  @Input() ftn_uic: string = "";

  ordersDataRecd: any = {recid: false, staffing: false, history: false, histIndex: 0}
  orderStaffing: any = [];
  ordersArr: any = [];

  ordersTabLoaded: boolean = false;
  ordersNoRecords: boolean = true;
  ordersTimeoutExpired: boolean = false;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    //Create the variable set that will hold all the information
      this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] = [];
      this.ds.tabs[this.ftn_uic]["ORDERS_STAFFING"] = [];
      this.ds.tabs[this.ftn_uic].ordersTabLoaded = false;
      this.ordersTabLoaded = false;
      this.ordersNoRecords = false;
      this.processOrderRecIDData();
  }

  processOrderRecIDData() {
    if(this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length == 0) {
      this.api.getOrderRecID(this.ftn_uic, this.ds.tabs[this.ftn_uic].type)
        .subscribe((results) => {
          this.conlog.log("ProcessOrderRecIDData - Returned Count is: " + results.length);
          if (results.indexOf("Execution Timeout Expired") == -1) {
            if(results[0] != undefined) {
              this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] = this.ordersArr = results;
              this.ordersDataRecd.recid = true;
              if(this.ordersArr.length > 0) this.getOrdersHistory(); else this.ordersDataRecd.history = true;
              if(this.ds.appMode == 'ftn') this.getOrdersStaffing(); else this.ordersDataRecd.staffing = true;
            } else this.completeTabProcess();
          } else {
            this.ordersArr = [];
            this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] = "Execution Timeout Expired";
            this.completeTabProcess();
          }
      })
    } else this.completeTabProcess();
  }

  getOrdersStaffing(){
    this.api.getOrderStaffingRecID(this.ftn_uic).subscribe((results) => {
      if (results[0] != undefined) {
        this.ds.tabs[this.ftn_uic]["ORDERS_STAFFING"] = results;
        this.ordersDataRecd.staffing = true;
        this.verifyAllDataLoaded();
      }
    });
  }

  getOrdersHistory(){
    // Get drilldown data for each rec id
    if(this.ordersDataRecd.histIndex < this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length) {
      let rec = this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][this.ordersDataRecd.histIndex];
      rec["HISTORY"] = [];
      rec["HistoryLoaded"] = false;

      // Grab the history for this recID
      this.api.getOrderHistory(rec["REC_ID"]).subscribe((history) => {
        if (history != null) {
          rec["HISTORY"] = history;
          rec["HistoryLoaded"] = true;
          this.ordersDataRecd.histIndex++;
          this.getOrdersHistory();
        }
      });
    } else {
      this.ordersDataRecd.history = true
      this.verifyAllDataLoaded();
    }
  }

  verifyAllDataLoaded() {
    if(this.ordersDataRecd.staffing && this.ordersDataRecd.history) {
      this.completeTabProcess();
    }
  }

  completeTabProcess() {
    this.ordersTabLoaded = this.ds.tabs[this.ftn_uic].ordersTabLoaded = true;
    this.ordersNoRecords = (this.ordersArr.length == 0);
    this.conlog.log("Orders have been loaded with " + ((this.ordersNoRecords) ? "no records." : "records."));
    this.orderStaffing = this.ds.tabs[this.ftn_uic]["ORDERS_STAFFING"];
    this.ordersTimeoutExpired = (this.ds.tabs[this.ftn_uic]["ORDER_RECID"] == "Execution Timeout Expired");
  }

  ordersColValueChanged(ind: number, col: string, arr: any): string | undefined {
    let ignoreColumns: any = ['act_desc', 'mod', 'mod_last_action'];
    if ((ind+1) < arr.length && ignoreColumns.find((ele: any) => ele == col) == undefined) {
      if(arr[ind][col] != undefined) {
        return (arr[ind][col] !== arr[ind + 1][col] ? 'cellHighlight' : 'cellNoHighlight');
      }
    }
    return "cellNoHighlight";
  }
}
