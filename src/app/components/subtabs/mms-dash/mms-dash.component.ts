import {Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

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
