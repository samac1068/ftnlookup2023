import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  @Input() ftn_uic: string;

  podData: any;
  hasData: boolean = false;

  constructor(private ds: DatastoreService, private conlog: ConlogService) { }

  ngOnInit(): void {
    // Now populate what is needed for the pod.
    this.podData = this.ds.tabs[this.ftn_uic]["JCRMReq"][0];
    this.hasData = (this.ds.tabs[this.ftn_uic]["JCRMReq"].length > 0);
    this.conlog.log("subtab: notes - loaded");
  }
}
