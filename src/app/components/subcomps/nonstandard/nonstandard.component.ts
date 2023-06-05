import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {HttpClient} from '@angular/common/http';
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-nonstandard',
  templateUrl: './nonstandard.component.html',
  styleUrls: ['./nonstandard.component.css']
})
export class NonstandardComponent implements OnInit {
  @Input() ftn_uic: string = "";

  // AG Grid Configuration Info
  columnDefs: any = [];
  headerHeight: number = 20;
  podData: any = [];
  hasData: boolean = false;

  constructor(private ds: DatastoreService, private httpClient:HttpClient, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.httpClient.get("assets/tbl_columns.json").subscribe((data: any) =>{
      this.columnDefs = data["nonstandard"];
    });

    this.podData = this.ds.tabs[this.ftn_uic]["JCRMNonStandard"];
    this.hasData = (this.podData != undefined);

    this.conlog.log("subtab: nostandard - loaded");
  }
}
