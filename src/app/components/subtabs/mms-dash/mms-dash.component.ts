import {Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';
// @ts-ignore
import { String } from '../../../ptypes/string.extensions';
@Component({
  selector: 'app-mms-dash',
  templateUrl: './mms-dash.component.html',
  styleUrls: ['./mms-dash.component.css']
})
export class MmsDashComponent implements OnInit, AfterViewInit {
  @Input() ftn_uic: string = "";

  mmsNoRecords: boolean = true;
  mdisNoRecords: boolean = true;

  mmsTimeout: boolean = false;
  mdisTimeout: boolean = false;

  mmsLoaded: boolean = false;
  mmsMdisLoaded: boolean = false;

  /*divActualWidth: number = -1;
  divComputedWidth: number = -1;*/

  MMSURL: string = "/MMS/ViewMessage.aspx?id=";

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["MMS_MSG"] = [];
    this.ds.tabs[this.ftn_uic]["MMS_MDIS"] = [];

    this.mmsLoaded = false;
    this.mmsMdisLoaded = false;
  }

  ngAfterViewInit() {
    // Computer any missing column width
    this.ds.calculateColWidths("mms");

    // Now get the data
    this.getMMS();
    this.getMDIS();
  }

  getMMS() {
    // Grab the list of MMS message based on the FTN
    if(this.ds.tabs[this.ftn_uic].type == 'ftn')
      this.api.getMMSMess(this.ftn_uic).subscribe(result => { this.evaluateMMSMess(result); });
    else
      this.api.getMMSUICMess(this.ftn_uic).subscribe(result => { this.evaluateMMSMess(result); });
  }

  getMDIS() {
    this.api.getMMSMDIS(this.ftn_uic)
      .subscribe(result => {
        this.ds.tabs[this.ftn_uic]["MMS_MDIS"] = result;
        this.mdisTimeout = (this.ds.tabs[this.ftn_uic]["MMS_MDIS"] == "Execution Timeout Expired");
        this.mdisNoRecords = this.ds.tabs[this.ftn_uic]["MMS_MDIS"][0] == undefined;
        this.mmsMdisLoaded = true;
        this.verifyReady();
      });
  }

  evaluateMMSMess(result: any) {
    this.ds.tabs[this.ftn_uic]["MMS_MSG"] = result;
    this.mmsTimeout = this.ds.tabs[this.ftn_uic]["MMS_MSG"] == "Execution Timeout Expired";
    this.mmsNoRecords = this.ds.tabs[this.ftn_uic]["MMS_MSG"][0] == undefined;
    this.mmsLoaded = true;
    this.verifyReady();
  }

 /* formatDTGInfo(data?: string): string {
    // This is used to just format the DTG data like what is done for the message
    let dtstr: string = "";

    if(data != undefined) {
      if(data.toLowerCase().indexOf("z") > -1) {
        // The ZULU indicator is in the string, needs to convert to standard date format  ddhhmmZMMMyy and return hh:mm dd MMM yy
        //let pat: RegExp = /Z/gi
        //data.replace(pat, "");
        //dtstr = data.substring(2, 4) + ":" + data.substring(4, 6);
        //dtstr += " " + data.substring(0, 2) + " " + data.substring(7, 10) + " " + data.substring(10);
        dtstr = data.substr(2, 2) + ":" + data.substr(4, 2);
        dtstr += data.substr(0, 2) + " " + data.substr(7, 3) + " " + data.substr(10);
      } else {
        dtstr = data; //new Date(data).toUTCString();
      }
    }

    return dtstr;
  }*/
  generateColLink(value: string) {
    // If the ID field, then create a link for this value
    return window.location.protocol + "//"  + window.location.hostname + this.MMSURL + value;
  }

  verifyReady() {
    if(this.mmsLoaded && this.mmsMdisLoaded)
      this.completeTabProcess();
  }

  completeTabProcess() {
    this.conlog.log("mms has been loaded.");
  }

  getColumnStyle(colName: string) {
    return (colName == 'ID' || colName == 'DTG') ? 'tblCenterCell' : 'tblLeftCell';
  }
}
