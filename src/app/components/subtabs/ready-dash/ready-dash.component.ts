import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {MatAccordion} from '@angular/material/expansion';
import {DatastoreService} from '../../../services/datastore.service';
import {WebapiService} from '../../../services/webapi.service';
import {CommService} from '../../../services/comm.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-ready-dash',
  templateUrl: './ready-dash.component.html',
  styleUrls: ['./ready-dash.component.css']
})
export class ReadyDashComponent implements OnInit {
  @Input() ftn_uic: string;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('podcontainer') podContainer: ElementRef;

  uicSuffix: any = ['FF', 'AA'];
  uicChecked: any = {personnel: false, supply: false, service: false, train: false, arms: false, total: false, comments: false, overall: false, remarks: false };
  readyHasData: boolean = false;
  readyTabLoaded: boolean = false;
  readyTimeoutExpired: boolean = false;
  readyArr: any = [];
  curUICCnt: number = 0;
  suffixIndex: number = 0;
  userInfoText: string;
  foundUIC: string = "";
  readyWidth: number = 0;
  timeoutCounter: number = 0;
  localTimer: any;

  blah: boolean = false;    // Used for testing only

  constructor(public ds: DatastoreService, private api: WebapiService, private comm: CommService, private conlog: ConlogService) { }

  ngOnInit(): void {
    // Initialize storage variables
    this.ds.tabs[this.ftn_uic]["READY"] = [];
    this.userInfoText = "Stand-By, waiting for results from ORDERS tab.";

    // Calculate the available width of the page
    this.readyWidth = window.innerWidth * .98;

    if(this.ds.tabs[this.ftn_uic].ordersTabLoaded)
      this.dataEvaluation();
    else {
      this.timeoutCounter = 0;
      this.localTimer = setInterval(this.evaluationDataLoad.bind(this), 1000);  // Need to wait until ordersTabLoaded is true
    }
  }

  evaluationDataLoad() {
    if(this.ds.tabs[this.ftn_uic].ordersTabLoaded){
      clearTimeout(this.localTimer);
      this.dataEvaluation();
    } else {
      this.timeoutCounter++;
      if(this.timeoutCounter >= 23) {
        this.ds.tabs[this.ftn_uic]["READY"].push('Execution Timeout Expired');
        clearTimeout(this.localTimer);
        this.completeTab();
      }
    }
  }

  dataEvaluation() {
    clearTimeout(this.localTimer);
    if(this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][0] != undefined && this.ds.tabs[this.ftn_uic]["ORDERS_RECID"] != 'Execution Timeout Expired') {
      this.userInfoText = "Stand-by, Loading READINESS Data.";
      this.requestReadyData();
    } else {
      this.completeTab();
    }
  }

  requestReadyData() {
    this.conlog.log("requestReadyData");
    // Time to retrieve the data for each pod
    for (let u = 0; u < this.ds.tabs[this.ftn_uic]["ORDERS_RECID"].length; u++) {
      let uic: string = this.ds.tabs[this.ftn_uic]["ORDERS_RECID"][u]["urf_uic"];

      if (uic != null && uic != '') {
        this.ds.tabs[this.ftn_uic]["READY"].push({
          uic: uic,
          uicDataLoaded: false,
          uicData: {},
          title: null,
          ricda: null,
          personnel: null,
          supply: null,
          service: null,
          train: null,
          comments: null
        });
      }
    }

    // Now get content specific data based on the UIC saved.
    if (this.ds.tabs[this.ftn_uic]['READY'].length > 0)
      this.getAllUICData();
    else
      this.readyTabLoaded = true;
    /*} else {
      console.log("There are no rec id available to search for. Ending attempt for readiness tab");
      this.completeTab();
    }*/
  }

  getAllUICData() {
    this.conlog.log("getAllUICData");
    if(this.curUICCnt < this.ds.tabs[this.ftn_uic]['READY'].length) {
      let uic: string = this.ds.tabs[this.ftn_uic]['READY'][this.curUICCnt].uic.substr(0, 4) + this.uicSuffix[this.suffixIndex];

      this.conlog.log("processing UIC: " + uic + "(" + this.curUICCnt + ")");
      this.api.getUIC(uic.toUpperCase()).pipe()
        .subscribe(result => {
          if(result[0] != undefined){
            this.ds.tabs[this.ftn_uic]['READY'][this.curUICCnt].uicDataLoaded = true;
            this.ds.tabs[this.ftn_uic]['READY'][this.curUICCnt].uicData = result[0];
            this.ds.tabs[this.ftn_uic]['READY'][this.curUICCnt].uic = this.foundUIC = uic.toUpperCase();

            //Move to the next UIC
            this.curUICCnt++;
            this.suffixIndex = 0;
          } else {
            // We didn't get any information with the first suffix, so attempt the second one
            this.suffixIndex++;

            if(this.suffixIndex > this.uicSuffix.length - 1) {
              // All attempts exhausted, move on to the next UIC
              this.curUICCnt++;
              this.suffixIndex = 0;
            }
          }

          this.getAllUICData();
        });
    } else {
      this.grabRicdaData();
    }
  }

  grabRicdaData() {
    this.conlog.log("grabRicdaData");
    // All uic data has been pulled, get RICDA data
    if(this.foundUIC != undefined && this.foundUIC != "") {
      this.api.getPersonnelRICDA(this.foundUIC)
        .subscribe(result => {
          if (result != null && result.length > 0) {
            this.ds.tabs[this.ftn_uic]["READY"][0].ricda = result[0].RICDA.toLocaleDateString("en-US");
          }

          //Get Readiness Data
          this.resetVariables();
        });

    } else this.resetVariables();
  }

  resetVariables() {
    this.curUICCnt = 0;
    this.suffixIndex = 0;
    this.prepareReadinessUIC();
  }

  prepareReadinessUIC() {
    // Identify the current UIC to pull data for
    let uic: string = this.ds.tabs[this.ftn_uic]['READY'][this.curUICCnt].uic;

    // Call for the readiness information for this specific UIC
    this.getReadinessData(uic);
  }

  // Load the data by calling the individual services and load. Only advance when all are loaded
  getReadinessData(uic: string) {
    // Get Personnel Data
    this.api.getUICPersonnel(uic)
      .subscribe(result => {
        this.storeReceivedReadyData(result, 'Personnel');
        this.evaluateUICData();
      });

    // Get Equipment Supply Data
    this.api.getUICEquipSupply(uic)
      .subscribe(result => {
        this.storeReceivedReadyData(result, 'Supply');
        this.evaluateUICData();
      });

    // Get Equipment Service Data
    this.api.getUICEquipService(uic)
      .subscribe(result => {
        this.storeReceivedReadyData(result, 'Service');
        this.evaluateUICData();
      });

    // Get Training Data
    this.api.getUICTraining(uic)
      .subscribe(result => {
        this.storeReceivedReadyData(result, 'Train');
        this.evaluateUICData();
      });

    // Get Personnel Arms
    this.api.getPersonnelArms(uic)
      .subscribe(result => {
        this.storeReceivedReadyData(result, 'Arms');
        this.evaluateUICData();
      });

    // Get Personnel Total
    this.api.getPersonnelTotal(uic)
      .subscribe(result => {
        this.storeReceivedReadyData(result, 'Total');
        this.evaluateUICData();
      });

    // Get Commander Comments
    this.api.getCMDComment(uic)
      .subscribe(result => {
        this.storeReceivedReadyData(result, 'Comments');
        this.evaluateUICData();
      });

    // Get UIC Overall
    this.api.getReadyOverall(uic)
      .subscribe(result => {
        this.storeReceivedReadyData(result, 'Overall');
        this.evaluateUICData();
      });

    // Get UIC Remarks
    this.api.getReadyRemarks(uic)
      .subscribe(result => {
        this.storeReceivedReadyData(result, 'Remarks');
        this.evaluateUICData();
      });
  }

  storeReceivedReadyData(results: any, section: string) {
    this.ds.tabs[this.ftn_uic]['READY'][this.curUICCnt][section] = [];
    this.ds.tabs[this.ftn_uic]['READY'][this.curUICCnt][section] = results;
    this.uicChecked[section.toLowerCase()] = true;
  }

  evaluateUICData() {
    if(this.ds.isAllObjTrue(this.uicChecked)) {
      // All data has been pulled for this uic, so we can move to the next one.
      this.ds.resetAllObj(this.uicChecked);
      this.curUICCnt++;

      if(this.curUICCnt < this.ds.tabs[this.ftn_uic]['READY'].length) {
        this.prepareReadinessUIC();
      } else {
        // All data has been pulled now we can display it
        this.userInfoText = "Stand-by, All data base been pulled. Processing and formatting.";
        this.preparePodTitle();
      }
    } else
      this.userInfoText = "Stand-by, Loading READINESS Data: Sections - " + this.ds.whatObjRemains(this.uicChecked);
  }

  preparePodTitle() {
    // Loop through all uic and generate the title based on the retrieved content
    for(let o = 0; o < this.ds.tabs[this.ftn_uic]['READY'].length; o++) {
      let data = this.ds.tabs[this.ftn_uic]['READY'][o];

      // Generate the title information
      let str = data.uic.toUpperCase() + "   ";
      str += (!this.ds.isNull(data.uicData['strready'])) ? data.uicData['strready'] + " " : " 0 ";
      str += (!this.ds.isNull(data.uicData['strreasn'])) ? data.uicData['strreasn'] : "";
      str += (!this.ds.isNull(data.uicData['strprrat'])) ? data.uicData['strprrat'] : "";
      str += (!this.ds.isNull(data.uicData['stresrat'])) ? data.uicData['stresrat'] : "";
      str += (!this.ds.isNull(data.uicData['strerrat'])) ? data.uicData['strerrat'] : "";
      str += (!this.ds.isNull(data.uicData['strtrrat'])) ? data.uicData['strtrrat'] : "";
      str += "|";

      str += "A-Level:"
      str += (!this.ds.isNull(data['Overall'][0])) ? data['Overall'][0]['OVERALL'] : " ";
      str += " AMM:"
      str += (!this.ds.isNull(data['Overall'][0])) ? data['Overall'][0]['AMM'] : " ";
      str += " AME:"
      str += (!this.ds.isNull(data['Overall'][0])) ? data['Overall'][0]['AME'] : " ";

      // Gotta store the title, will be updating after all data has been pulled.
      this.ds.tabs[this.ftn_uic]['READY'][o].title = "[ " + str + " ]";
      //this.ds.tabs[this.ftn_uic]['READY'][o].index = o;
    }

    this.completeTab();
  }

  completeTab() {
    // Now mark if data is available or not
    this.readyHasData = this.ds.tabs[this.ftn_uic]['READY'].length > 0;
    this.readyTimeoutExpired = (this.ds.tabs[this.ftn_uic]["READY"][0] == 'Execution Timeout Expired');
    this.readyTabLoaded = true;
    this.conlog.log("readiness has been loaded and" + ((this.readyHasData) ? " has" : " doesn't have") + " data.");
  }
}
