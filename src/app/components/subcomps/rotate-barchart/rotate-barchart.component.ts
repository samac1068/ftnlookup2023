import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {Timer} from "ag-grid-community";

@Component({
  selector: 'app-rotate-barchart',
  templateUrl: './rotate-barchart.component.html',
  styleUrls: ['./rotate-barchart.component.css']
})
export class RotateBarchartComponent implements OnInit {
  @Input() uicData: any;

  @ViewChild('divHeader', { static: true })
  divHeader: ElementRef|null = null;

  minStart: number = -1;
  maxEnd: number = -1;
  yearCount: number = 20;
  qtrWidth = 22;
  curXPos: number = -1;
  windowDim: any = { width: null, height: null };
  userInfoText: string = "";
  barchartHadData: boolean = false;
  barchartLoaded: boolean = false;
  barchartTimeout: boolean = false;
  localTimer: any;
  qtrArr: any = [];
  loopCnt: number = -1;

  constructor(public ds: DatastoreService) { }

  ngOnInit(): void {
    // Determine the window/div dimension
    this.windowDim.width = window.innerWidth * .964;
    this.windowDim.height = window.innerHeight * .31;

    // Calculate the start, end, and number of years to create
    this.minStart = new Date().getFullYear() - (this.yearCount / 2);
    this.maxEnd = new Date().getFullYear() + (this.yearCount / 2);

    if(this.uicData.rd_barchartInfo.length > 0)
      this.dataEvaluation();
    else {
      this.loopCnt = 0;
      this.waitForOrdersToLoad();
    }
  }

  waitForOrdersToLoad() {
    this.localTimer = setInterval(this.evaluateRotateDataLoad.bind(this), 1000); // Need to wait until ordersTabLoaded is true
  }

  evaluateRotateDataLoad() {
    if(this.uicData.rd_barchartInfo.length > 0 || ++this.loopCnt === 10){
      clearInterval(this.localTimer);
      this.dataEvaluation();
    }
  }

  dataEvaluation() {
    if(this.uicData.rd_barchartInfo.length > 0) {
      this.curXPos = 2;
      this.userInfoText = "Stand-by, Loading ROTATION Data.";
      this.buildQtrArrInfo();
    } else this.completeTab();
  }

  buildQtrArrInfo() {
    for(let y = 0; y < this.yearCount; y++) {
      for(let q = 0; q < 4; q++) {
        this.qtrArr.push({ year: Number(this.minStart.toString().substring(2,4)) + y, qtr: (q + 1) });
      }
    }

    this.completeTab();
  }

  completeTab() {
    // Now mark if data is available or not
    this.barchartHadData = this.uicData.rd_barchartInfo.length > 0;
    this.barchartLoaded = true;
  }
}
