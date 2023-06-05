import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {WebapiService} from '../../../services/webapi.service';
import { forkJoin } from 'rxjs';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-rotate-dash',
  templateUrl: './rotate-dash.component.html',
  styleUrls: ['./rotate-dash.component.css']
})
export class RotateDashComponent implements OnInit {
  @Input() ftn_uic: string = "";

  hasRotateData: boolean = false;
  rotatePodLoaded: boolean = false;
  rotateInfoText: string = "";
  curUICIndex: number = 0;
  localTimer: any;

  constructor(public ds: DatastoreService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["ROTATE"] = [];
    this.rotateInfoText = "Stand-By, waiting for results from ORDERS tab.";

    if(this.ds.tabs[this.ftn_uic].ordersTabLoaded)
      this.rotateOrdersEvaluation();
    else
      this.waitForOrdersToLoad();
  }

  waitForOrdersToLoad() {
    this.localTimer = setInterval(this.evaluateRotateDataLoad.bind(this), 1000); // Need to wait until ordersTabLoaded is true
  }

  evaluateRotateDataLoad() {
    if(this.ds.tabs[this.ftn_uic].ordersTabLoaded){
      clearTimeout(this.localTimer);
      this.rotateOrdersEvaluation();
    }
  }

  rotateOrdersEvaluation() {
    if(this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][0] != undefined && this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] != 'Execution Timeout Expired') {
      this.rotateInfoText = "Stand-by, Processing ROTATE Data.";
      this.pullRotateOrdersData();
    } else {
      this.completeTab();
    }
  }

  pullRotateOrdersData() {
    if(this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][0] != undefined) {
      for (let u = 0; u < this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length; u++) {
        let uic: any = this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][u];
        let isFound: boolean = (this.ds.tabs[this.ftn_uic]["ROTATE"].find((value: any) => value.urf_uic == this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][u]["urf_uic"])) != undefined;

        if (!isFound) {
          if (uic != null && uic != '') {
            this.ds.tabs[this.ftn_uic]["ROTATE"].push({
              fullUIC: uic["urf_uic"],
              uicInfo: {
                uic: uic["urf_uic"].substring(0, 4),
                uic6: uic["urf_uic"],
                aname: null,
                compo: null,
                src: null,
                branch: null,
                mtoeauth: null
              },
              rd_dwell: null,
              rd_dateInfo: null,
              rd_barchartInfo: null,
              rd_arfogenInfo: null,
              rd_dwellInfo: null,
              rd_usaInfo: null
            });
          }
        }
      }

      // Do we have anything that we can process?
      if (this.ds.tabs[this.ftn_uic]["ROTATE"].length > 0) {
        this.rotateInfoText = "Stand-by, Getting ROTATE Data.";
        this.curUICIndex = 0;
        this.setUICRotation();
      } else this.completeTab();
    } else this.completeTab();
  }

  setUICRotation() {
    if(this.curUICIndex < this.ds.tabs[this.ftn_uic]["ROTATE"].length)
      this.getRotationData();
    else {
      this.curUICIndex = 0;
      this.setDwellRotation();
    }
  }

  getRotationData() {
    let uicRec = this.ds.tabs[this.ftn_uic]["ROTATE"][this.curUICIndex]["uicInfo"];
    this.api.getRotationUIC(uicRec["uic"])
      .subscribe(result => {
        // Load the incoming data to the appropriate record
        if(result.length > 0) {
          uicRec["uic6"] = result[0]["uic"];
          uicRec["aname"] = result[0]["aname"].trim();
          uicRec["compo"] = result[0]["compo"];
          uicRec["src"] = result[0]["src"];
          uicRec["branch"] = result[0]["branch"];
          uicRec["mtoeauth"] = result[0]["mtoeauth"];
        }
        this.curUICIndex++;
        this.setUICRotation();
      });
  }

  setDwellRotation() {
    if(this.curUICIndex < this.ds.tabs[this.ftn_uic]["ROTATE"].length)
      this.getRotationDwellData();
    else {
      this.completeTab();
    }
  }

  getRotationDwellData() {
    // Need to call them one at a time because of the storage requirement
    let uicRec = this.ds.tabs[this.ftn_uic]["ROTATE"][this.curUICIndex];
    let sentUIC: string = uicRec["fullUIC"].substring(0,4);

    // Using forkJoin to call all five API at once and combine in to single observable result
    forkJoin([

      this.api.getRotationDwell(sentUIC),
      this.api.getRotationDate(sentUIC),
      this.api.getRotationBarchart(sentUIC),
      this.api.getArforgen(sentUIC),
      this.api.getDwell(sentUIC)
    ]).subscribe((allResults) => {
      //console.log(sentUIC, allResults);
      uicRec["rd_dwell"] = (allResults[0].length > 0) ? allResults[0] : [];
      uicRec["rd_dateInfo"] = (allResults[1].length > 0) ? allResults[1] : [];
      uicRec["rd_barchartInfo"] = (allResults[2].length > 0) ? allResults[2] : [];
      uicRec["rd_arfogenInfo"] = (allResults[3].length > 0) ? allResults[3] : [];
      uicRec["rd_dwellInfo"] = (allResults[4].length > 0) ? allResults[4] : [];

      // Repeat the process for the next uic
      this.curUICIndex++;
      this.setDwellRotation();
    });
  }

  completeTab() {
    // Now mark if data is available or not
    this.hasRotateData = this.ds.tabs[this.ftn_uic]["ROTATE"].length > 0;
    this.rotatePodLoaded = true;
    this.conlog.log("rotation has been loaded.");
  }
}
