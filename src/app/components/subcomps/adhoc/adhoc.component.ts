import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {HttpClient} from '@angular/common/http';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-adhoc',
  templateUrl: './adhoc.component.html',
  styleUrls: ['./adhoc.component.css']
})
export class AdhocComponent implements OnInit {
  @Input() ftn_uic: string = "";

  columnDefs: any = [];
  podData = [];
  headerHeight: number = 20;
  hasData: boolean = false;

  constructor(private ds: DatastoreService, private httpClient: HttpClient, private conlog: ConlogService) { }

  ngOnInit(): void {
    // Get the columns and the associated fields
    this.httpClient.get("assets/tbl_columns.json").subscribe((data: any) =>{
      this.columnDefs = data["adhoc"];
    });

    this.podData = this.ds.tabs[this.ftn_uic]["JCRMAdHoc"];
    this.hasData = (this.podData != undefined);

    this.conlog.log("subtab: adhoc - loaded");
  }
}
