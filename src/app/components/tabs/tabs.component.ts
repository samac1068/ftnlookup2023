import {Component, Input, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {DatastoreService} from '../../services/datastore.service';
import {ConfirmDialogService} from '../../dialogs/confirm-dialog/confirm-dialog.service';
import {WebapiService} from '../../services/webapi.service';
import {HttpClient} from '@angular/common/http';
import {ConlogService} from '../../modules/conlog/conlog.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.css']
})
export class TabsComponent implements OnInit {

  @Input() ftn_uic: string = "";
  @ViewChild('innerTab', {read: ViewContainerRef}) innerTab = null

  tabs: any = [];
  selected: number = -1;
  tabAnimation: string = "3ms";

  podLabel:any = {};
  podLblTxt: string = "";

  tabFTN: any = [
    { title: 'JCRM', comp: 'jcrm-dash', loaded: false},
    //{ title: 'GFMAP', comp: 'gfmap-dash'},
    { title: 'ORDERS', comp: 'orders-dash'},
    { title: 'JOPES', comp: 'jopes-dash'},
    { title: 'MOB', comp: 'mob-dash'},
    { title: 'READINESS', comp: 'ready-dash'},
    { title: 'MDIS', comp: 'mdis-dash'},
    { title: 'MMS', comp: 'mms-dash'},
    { title: 'ROTATION', comp: 'rotate-dash'},
    { title: 'IND ORD', comp: 'individual-order-dash'},
    //{ title: 'MOVEMENT', comp: 'move-dash'},
    { title: 'ITAP', comp: 'itap-dash'}
  ];

  tabUIC: any = [
    { title: 'DRRS-A', comp: 'drrsa-dash'},
    { title: 'ORDERS', comp: 'orders-dash'},
    { title: 'JOPES', comp: 'jopes-dash'},
    { title: 'MOB', comp: 'mob-dash'},
    { title: 'READINESS', comp: 'ready-dash'},
    { title: 'MDIS', comp: 'mdis-dash'},
    { title: 'MMS', comp: 'mms-dash'},
    { title: 'ROTATION', comp: 'rotate-dash'},
    { title: 'ITAP', comp: 'itap-dash'},
    { title: 'FMSWEB', comp: 'fmsweb-dash'},
    { title: 'SAMAS', comp: 'samas-dash'},
    { title: 'IND ORD', comp: 'individual-order-dash'},
    { title: 'AOS', comp: 'aos-dash'}
  ];

  constructor(private ds:DatastoreService, private cds: ConfirmDialogService, private api: WebapiService, private httpClient: HttpClient, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.conlog.log("Tabs: ngOnInit");
    // Pull in a store all column definitions
    this.httpClient.get("assets/tbl_columns.json").subscribe(columnsList => {
      this.ds.columnDefinitions = columnsList;

      this.tabs = (this.ds.tabs[this.ftn_uic].type == 'ftn') ? this.tabFTN : this.tabUIC;

      if(this.ds.tabs[this.ftn_uic].type == 'ftn') {
        this.api.getGFMAPFTN(this.ftn_uic)
          .subscribe((results) => {
            this.ds.tabs[this.ftn_uic]['FTN'] = results;

            //Pull the data and generate the label from the return
            this.generateTitleBar();
          });
      } else {
        this.api.getUIC(this.ftn_uic)
          .subscribe((results) => {
            this.ds.tabs[this.ftn_uic]['UIC'] = results;

            //Pull the data and generate the label from the return
            this.generateTitleBar();
          });
      }
    });
  }

  generateTitleBar() {
    this.conlog.log("Tabs: generateTitleBar");

    // This is the bar that displays all the information related to this FTN or UIC.
    this.podLblTxt = this.ftn_uic.toUpperCase();

    if(this.ds.tabs[this.ftn_uic].type == "ftn") {
      let lblData = this.ds.tabs[this.ftn_uic]['FTN'][0];
      if (lblData.operation != undefined) this.podLblTxt += " | " + lblData.operation;
      if (lblData.cycle != undefined) this.podLblTxt += " | " + lblData.cycle;
      if (lblData.capability != undefined) this.podLblTxt += " | " + lblData.capability;
      if (lblData.Destination != undefined) this.podLblTxt += " | " + lblData.Destination;
      if (lblData.LAD != undefined) this.podLblTxt += " | " + lblData.LAD;
    } else {
      if(this.ds.tabs[this.ftn_uic]['UIC'].length > 0) {
        let lblData = this.ds.tabs[this.ftn_uic]['UIC'][0];
        if (lblData.STRANAME != undefined) this.podLblTxt += " | " + lblData.STRANAME;
        if (lblData.STRCOMPO != undefined) {
          switch (lblData.STRCOMPO) {
            case "1":
              this.podLblTxt += " | Active";
              break;
            case "2":
              this.podLblTxt += " | National Guard";
              break;
            case "3":
              this.podLblTxt += " | Reserve";
              break;
          }
        }
      } else
        this.podLblTxt += " | UNDEFINED | UNDEFINED";
    }
  }

  setValue(evt: any) {
    this.selected = evt;
  }
}
