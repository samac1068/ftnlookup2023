import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import {DatastoreService} from '../../../services/datastore.service';
import {WebapiService} from '../../../services/webapi.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';


@Component({
  selector: 'app-jcrm-dash',
  templateUrl: './jcrm-dash.component.html',
  styleUrls: ['./jcrm-dash.component.css']
})
export class JcrmDashComponent implements OnInit {
  @Input() ftn_uic: string;
  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('podcontainer') podContainer: ElementRef;

  dataChecked: any = {req: false, fpnoms: false, jfpnoms: false, nonstandard: false, adhoc: false };
  curstatus: string = 'Loading...';
  jcrmHasData: boolean = false;
  jcrmPodsLoaded: boolean = false;
  dataIndex: number = -1;

  constructor(private ds: DatastoreService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    //Initialize all storage areas
    this.ds.tabs[this.ftn_uic]["JCRMReq"] = {};
    this.ds.tabs[this.ftn_uic]["JCRMFPNoms"] = [];
    this.ds.tabs[this.ftn_uic]["JCRMJFPNoms"] = [];
    this.ds.tabs[this.ftn_uic]["JCRMNonStandard"] = [];
    this.ds.tabs[this.ftn_uic]["JCRMAdHoc"] = [];

    // When called, let's get the information
    this.processNextPodItem();
  }

  processNextPodItem(){
    this.dataIndex++;
    if(this.dataIndex < 5) {
      switch(this.dataIndex){
        case 0:
          this.getRequirements();
          break;
        case 1:
          this.getFPNoms();
          break;
        case 2:
          this.getJFPNoms();
          break;
        case 3:
          this.getNonstandard();
          break;
        case 4:
          this.getAdhoc();
          break;
      }
    } else {
      this.jcrmPodsLoaded = true;
      this.multiDataValidation();
    }
  }

  getRequirements(){
    this.api.getJCRMRequirement(this.ftn_uic)
      .subscribe((results) => {
        if(results.length > 0) {
          results[0].dateApproved = this.ds.setDateFormatFromString(results[0].dateApproved, 'dd MMM yy');
          results[0].endDate = this.ds.setDateFormatFromString(results[0].endDate, 'dd MMM yy');
          results[0].modifiedDate = this.ds.setDateFormatFromString(results[0].modifiedDate, 'dd MMM yy');
          results[0].startDate = this.ds.setDateFormatFromString(results[0].startDate, 'dd MMM yy');
          this.ds.tabs[this.ftn_uic]["JCRMReq"] = results[0];
        }

        this.dataChecked.req = true;
        this.processNextPodItem();
      });
  }

  getFPNoms() {
    this.api.getJCRMFPNoms(this.ftn_uic)
      .subscribe((results) => {
        if(results.length > 0) {
          for (let k = 0; k < results.length; k++) {
            results[k].aad = this.ds.setDateFormatFromString(results[k].aad, 'dd MMM yy');
            results[k].alertDate = this.ds.setDateFormatFromString(results[k].alertDate, 'dd MMM yy');
            results[k].concurrenceDate = this.ds.setDateFormatFromString(results[k].concurrenceDate, 'dd MMM yy');
            results[k].createDate = this.ds.setDateFormatFromString(results[k].createDate, 'dd MMM yy');
            results[k].deleteDate = this.ds.setDateFormatFromString(results[k].deleteDate, 'dd MMM yy');
            results[k].endDate = this.ds.setDateFormatFromString(results[k].endDate, 'dd MMM yy');
            results[k].lad = this.ds.setDateFormatFromString(results[k].lad, 'dd MMM yy');
            results[k].mobilizationDate = this.ds.setDateFormatFromString(results[k].mobilizationDate, 'dd MMM yy');
            results[k].modifiedDate = this.ds.setDateFormatFromString(results[k].modifiedDate, 'dd MMM yy');
            results[k].previousDemobilizationDate = this.ds.setDateFormatFromString(results[k].previousDemobilizationDate, 'dd MMM yy');
            results[k].previousRedeployDate = this.ds.setDateFormatFromString(results[k].previousRedeployDate, 'dd MMM yy');
            results[k].RequireRequestcreatedDate = this.ds.setDateFormatFromString(results[k].RequireRequestcreatedDate, 'dd MMM yy');
            results[k].RequireRequestdeletedDate = this.ds.setDateFormatFromString(results[k].RequireRequestdeletedDate, 'dd MMM yy');
            results[k].RequireRequestmodifiedDate = this.ds.setDateFormatFromString(results[k].RequireRequestmodifiedDate, 'dd MMM yy');
            results[k].releasedByDate = this.ds.setDateFormatFromString(results[k].releasedByDate, 'dd MMM yy');
            results[k].requiredLad = this.ds.setDateFormatFromString(results[k].requiredLad, 'dd MMM yy');
            results[k].submittedDate = this.ds.setDateFormatFromString(results[k].submittedDate, 'dd MMM yy');
          }

          this.ds.tabs[this.ftn_uic]["JCRMFPNoms"] = results;
        }

        this.dataChecked.fpnoms = true;
        this.processNextPodItem();
      });
  }

  getJFPNoms() {
    this.api.getJCRMJFPNoms(this.ftn_uic)
      .subscribe((results) => {
        if(results.length > 0) {
          for (let j = 0; j < results.length; j++) {
            results[j].aad = this.ds.setDateFormatFromString(results[j].aad, 'dd MMM yy');
            results[j].alertDate = this.ds.setDateFormatFromString(results[j].alertDate, 'dd MMM yy');
            results[j].concurrenceDate = this.ds.setDateFormatFromString(results[j].concurrenceDate, 'dd MMM yy');
            results[j].createDate = this.ds.setDateFormatFromString(results[j].createDate, 'dd MMM yy');
            results[j].deleteDate = this.ds.setDateFormatFromString(results[j].deleteDate, 'dd MMM yy');
            results[j].endDate = this.ds.setDateFormatFromString(results[j].endDate, 'dd MMM yy');
            results[j].lad = this.ds.setDateFormatFromString(results[j].lad, 'dd MMM yy');
            results[j].mobilizationDate = this.ds.setDateFormatFromString(results[j].mobilizationDate, 'dd MMM yy');
            results[j].modifiedDate = this.ds.setDateFormatFromString(results[j].modifiedDate, 'dd MMM yy');
            results[j].previousDemobilizationDate = this.ds.setDateFormatFromString(results[j].previousDemobilizationDate, 'dd MMM yy');
            results[j].previousRedeployDate = this.ds.setDateFormatFromString(results[j].previousRedeployDate, 'dd MMM yy');
            results[j].RequireRequestcreatedDate = this.ds.setDateFormatFromString(results[j].RequireRequestcreatedDate, 'dd MMM yy');
            results[j].RequireRequestdeletedDate = this.ds.setDateFormatFromString(results[j].RequireRequestdeletedDate, 'dd MMM yy');
            results[j].RequireRequestmodifiedDate = this.ds.setDateFormatFromString(results[j].RequireRequestmodifiedDate, 'dd MMM yy');
          }

          this.ds.tabs[this.ftn_uic]["JCRMJFPNoms"] = results;
        }

        this.dataChecked.jfpnoms = true;
        this.processNextPodItem();
      });
  }

  getNonstandard() {
    this.api.getJCRMNonStandard(this.ftn_uic)
      .subscribe((results) => {
        if(results.length > 0) {
          this.ds.tabs[this.ftn_uic]["JCRMNonStandard"] = results;
        }

        this.dataChecked.nonstandard = true;
        this.processNextPodItem();
      });
  }

  getAdhoc() {
    this.api.getJCRMAdHoc(this.ftn_uic)
      .subscribe((results) => {
        if(results.length > 0) {
          this.ds.tabs[this.ftn_uic]["JCRMAdHoc"] = results;
        }

        this.dataChecked.adhoc = true;
        this.processNextPodItem();
      });
  }

  multiDataValidation() {
    if(this.ds.isAllObjTrue(this.dataChecked))
      if(this.ds.tabs[this.ftn_uic]['JCRMJFPNoms'].length > 0
        || this.ds.tabs[this.ftn_uic]['JCRMFPNoms'].length > 0
        || this.ds.tabs[this.ftn_uic]['JCRMReq'].length > 0
        || this.ds.tabs[this.ftn_uic]['JCRMNonStandard'].length > 0
        || this.ds.tabs[this.ftn_uic]['JCRMAdHoc'].length > 0) {
        this.conlog.log("There is some JCRM data");
        this.jcrmHasData = true;
      } else {
        this.jcrmHasData = false;
        this.curstatus = 'No Data Found';
        this.conlog.log("No JCRM Data Found");
      }
    }
  }
