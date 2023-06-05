import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-move-dash',
  templateUrl: './move-dash.component.html',
  styleUrls: ['./move-dash.component.css']
})
export class MoveDashComponent implements OnInit {
  @Input() ftn_uic: string;

  hasMoveData: boolean = false;
  podLoaded: boolean = false;
  curRecInd: number = 0;
  moveInfoText: string;
  cardDim: any = {};
  paxGroups: string[] = ["DEPLOY", "REDEPLOY"];
  localTimer: any;

  /* GOOGLE AREA CHART */
  gchart: any = {
    title: "Deploy/Redeploy Pax by Date",
    type: "area",
    data: null,

  }
  /* AREA CHART VARIABLES */
  view: any[] = [700, 400];
  scheme: any = ["#704FC4", "#4B852C", "#B67A3D", "#5B6FCB", "#25706F"];		// Default color palette
  title = "Deploy/Redeploy Pax by Date Per REC ID";
  chartType = "Area";

  /*   These are additional options for the area chart, but either not used or default was accepted
    schemeType: string = "ordinal"; // ordinal or linear
    animations: boolean = true;
    legend: boolean = true;
    legendTitle: string = "Movement";
    legendPosition: string = "right"; // below or right
    xAxis: boolean = true;
    yAxis: boolean = true;
    showGridLines: boolean = true;
    roundDomains: boolean = false;
    showXAxisLabel: boolean = true;
    showYAxisLabel: boolean = true;
    xAxisLabel: string = "Date";
    yAxisLabel: string = "Pax";
    timeline: boolean = true;
    trimXAxisTicks: boolean = true;
    trimYAxisTicks: boolean = true;
    rotateXAxisTicks: boolean = true;
    maxXAxisTickLength: number = 16;
    maxYAxisTickLength: number = 16;
    xAxisTickFormatting: function
    yAxisTickFormatting: function
    xAxisTicks: any[]
    yAxisTicks: any[]
    autoScale: boolean = false;
    curve: function
    gradient: boolean = false;
    activeEntries: any[]
    tooltipDisabled: boolean = false;
    xScaleMin: any
    xScaleMax: any
    yScaleMin: number
    yScaleMax: number
   */

  constructor(public ds: DatastoreService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    // Initialize the various variables
    this.cardDim["width"] = 0;
    this.cardDim["height"] = 0;

    this.ds.tabs[this.ftn_uic]["MOVE"] = [];
    this.moveInfoText = "Stand-By, waiting for results from ORDER tab.";

    if(this.ds.tabs[this.ftn_uic].ordersTabLoaded)
      this.moveOrdersEvaluation();
    else
      this.waitForOrdersToLoad();
  }

  waitForOrdersToLoad() {
    this.localTimer = setInterval(this.evaluateMoveDataLoad.bind(this), 1000); // Need to wait until ordersTabLoaded is true
  }

  evaluateMoveDataLoad() {
    if(this.ds.tabs[this.ftn_uic].ordersTabLoaded){
      clearTimeout(this.localTimer);
      this.moveOrdersEvaluation();
    }
  }

  moveOrdersEvaluation() {
    if(this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][0] != undefined && this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] != 'Execution Timeout Expired') {
      this.moveInfoText = "Stand-by, Processing ORDERS Data.";
      this.pullOrdersData();
    } else {
      this.completeTab();
    }
  }

  pullOrdersData() {
    for (let u = 0; u < this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length; u++) {
      let recid: string = this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][u]["REC_ID"];

      if (recid != null && recid != '') {
        this.ds.tabs[this.ftn_uic]["MOVE"].push({
          RECID: recid,
          DATA: null
        });
      }
    }

    // Do we have anything that we can process?
    if(this.ds.tabs[this.ftn_uic]["MOVE"].length > 0){
      this.curRecInd = 0;
      this.moveInfoText = "Stand-by, Getting MOVEMENT HISTORY Data.";
      this.getMovementHistory();
    } else this.organizeData();
  }

  getMovementHistory() {
    // Load the data from the individual rec id using the same FTN
    if(this.curRecInd < this.ds.tabs[this.ftn_uic]["MOVE"].length) {
      this.api.getMovementHistory(this.ftn_uic, this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["RECID"])
        .subscribe(results => {
          this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd].DATA = results;

          //Advance to the next Rec ID
          this.curRecInd++;
          this.getMovementHistory();
        });
    } else {
      this.curRecInd = 0;
      this.moveInfoText = "Stand-by, Getting MOVEMENT LAD Data.";
      this.getMovementLAD();
    }
  }

  getMovementLAD() {
    if(this.curRecInd < this.ds.tabs[this.ftn_uic]["MOVE"].length) {
      this.api.getMovementLAD(this.ftn_uic)
        .subscribe(results => {
          this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["LAD"] = [];
          this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["LAD"]["ORDER"] = [];
          this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["LAD"]["MOBPLAN"] = [];
          this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["LAD"]["GFMAP"] = [];
          this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["LAD"]["FRED"] = [];

          // Rotate through and assign the information
          let lad = this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["LAD"];

          for(let i = 0; i < results.length; i++) {
            if(results[i]["Dates"] != null) {
              switch (results[i]["Dates"].charAt(0)) {
                case "O":
                  lad["ORDER"].push(results[i]["Dates"].substring(2));
                  break;
                case "M":
                  lad["MOBPLAN"].push(results[i]["Dates"].substring(2));
                  break;
                case "G":
                  lad["GFMAP"].push(results[i]["Dates"].substring(2));
                  break;
                case "F":
                  lad["FRED"].push(results[i]["Dates"].substring(2));
                  break;
              }
            }
          }

          //Advance to the next Rec ID
          this.curRecInd++;
          this.getMovementLAD();
        });
    } else {
      this.organizeData();
    }
  }

  organizeData() {
    this.calculateCardDims();
    this.prepData();
  }

  calculateCardDims() {
    let availWidth = window.innerWidth * .995;
    let availHeight = window.innerHeight * .98;
    let cardCount: number = this.ds.tabs[this.ftn_uic]['MOVE'].length;
    let cardRow: number = ((cardCount >= 3) ? 3 : cardCount);
    let rowCnt: number = this.ds.tabs[this.ftn_uic]['MOVE'].length / cardRow;

    // On average we want no more than three cards per row as this will give the right dimensions to see the content
    this.cardDim.width = availWidth / cardRow - (cardRow * 10);
    this.cardDim.height = availHeight / rowCnt - (rowCnt * 5);
    this.cardDim.availWidth = availWidth;
    this.cardDim.availHeight = availHeight;

    //console.log(this.cardDim.width, this.cardDim.height);
  }

  prepData() {
    // Need to properly format the data to be used by the charting system
    this.curRecInd = 0;

    for(let a = 0; a < this.ds.tabs[this.ftn_uic]["MOVE"].length; a++) {
      this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["MISSION"] = [];

      let series: any = {};

      for(let c = 0; c < this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["DATA"].length; c++) {
        let item = this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["DATA"][c];
        if(series[item["Mission"].toLowerCase()] == undefined) series[item["Mission"].toLowerCase()] = [];
        series[item["Mission"].toLowerCase()].push({name : item["Date"], value: item["pax"]});
      }

      for(let b = 0; b < this.paxGroups.length; b++) {
        if(series[this.paxGroups[b].toLowerCase()] != undefined) {
          this.ds.tabs[this.ftn_uic]["MOVE"][this.curRecInd]["MISSION"].push(
            {name: this.paxGroups[b], series: series[this.paxGroups[b].toLowerCase()]}
          );
        }
      }

      this.curRecInd++;
    }

    this.completeTab();
  }

  completeTab() {
    // Now mark if data is available or not
    this.hasMoveData = this.ds.tabs[this.ftn_uic]["MOVE"].length > 0;
    this.podLoaded = true;
    this.conlog.log("movement has been loaded.");
  }

  joinColumnFromObject(arr: any, column: string, sep: string = ",") {
    let tempArr: any = [];

    for(let o = 0; o < arr.length; o++) {
      tempArr.push(arr[column]);
    }

    return tempArr.join(sep);
  }
}
