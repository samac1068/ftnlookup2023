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
      this.ordersNoRecords = true;

      this.processOrderRecIDData();
  }

  processOrderRecIDData() {
    if(this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length == 0) {
      this.api.getOrderRecID(this.ftn_uic, this.ds.tabs[this.ftn_uic].type).subscribe((results) => {
        if (results != null && results.indexOf("Execution Timeout Expired") == -1) {
          this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] = this.ordersArr = results;

          // Get drilldown data for each rec id
          for(let l = 0; l < this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length; l++) {
            let rec = this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][l];
            rec["HISTORY"] = [];
            rec["HistoryLoaded"] = false;

            this.api.getOrderHistory(rec["REC_ID"]).subscribe((history) => {
              if(history != null){
                rec["HISTORY"] = history;
                rec["HistoryLoaded"] = true;
              }

              // Only indicate that all is done IF all are done.
              if(this.verifyAllHistoryLoaded()) {
                this.completeTabProcess();
              }
            });
          }
        } else {
          this.ordersArr = [];
          this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] = "Execution Timeout Expired";
          this.completeTabProcess();
        }
      });

      //Collect the Orders Staffing Information - If any
      this.api.getOrderStaffingRecID(this.ftn_uic).subscribe((results) => {
        this.ds.tabs[this.ftn_uic]["ORDERS_STAFFING"] = results;
      });

    } else this.completeTabProcess();
  }

  verifyAllHistoryLoaded(){
    let doneRecCount = 0;

    for(let r = 0; r < this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length; r++) {
      if(this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][r]["HistoryLoaded"])
        doneRecCount++;
    }

    return doneRecCount == this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length;
  }

  completeTabProcess() {
    this.ordersTabLoaded = this.ds.tabs[this.ftn_uic].ordersTabLoaded = true;
    this.ordersNoRecords = (this.ordersArr.length == 0);
    this.conlog.log("orders has been loaded with " + ((this.ordersNoRecords) ? "no records." : "records."));

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
