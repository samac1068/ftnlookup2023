import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {WebapiService} from '../../../services/webapi.service';
import {CommService} from '../../../services/comm.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-requirement',
  templateUrl: './requirement.component.html',
  styleUrls: ['./requirement.component.css']
})
export class RequirementComponent implements OnInit {
  @Input() ftn_uic: string;

  podData: any;
  hasData: boolean = false;

  constructor(private ds: DatastoreService, private comm: CommService, private conlog: ConlogService) { }

  ngOnInit(): void {
    // Now populate what is needed for the pod.
    this.podData = this.ds.tabs[this.ftn_uic]["JCRMReq"];
    this.hasData = (this.podData != undefined)
    this.conlog.log("subtab: requirement - loaded");
  }

  openNewTab(ftn: string) {
    // Take the supplied FTN and open a new tab
    let podData: any = {};

    podData.ftn_uic = ftn;
    podData.index = -1;
    podData.type = (ftn.length == 11) ? 'ftn' : 'uic';

    // Send an emitter to announce the new tab needs to be added
    this.comm.openNewTab.emit(podData);
  }
}
