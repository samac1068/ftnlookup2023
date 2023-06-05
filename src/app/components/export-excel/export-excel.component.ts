import {Component, Input, OnInit} from '@angular/core';
import {CommService} from '../../services/comm.service';
import {ConlogService} from '../../modules/conlog/conlog.service';
import {ExcelService} from '../../services/excel.service';
import {DatastoreService} from '../../services/datastore.service';

@Component({
  selector: 'app-export-excel',
  templateUrl: './export-excel.component.html',
  styleUrls: ['./export-excel.component.css']
})
export class ExportExcelComponent implements OnInit {
  @Input() ftn_uic: string;
  @Input() selTab: string;
  /*@Input() selCol: string;*/

  constructor(private conlog: ConlogService, private excel: ExcelService, private ds: DatastoreService) { }

  ngOnInit(): void {
  }

  exportClickHandler() {
    this.conlog.log("Export To Excel Clicked - Excel Service Called");
    this.excel.exportAsExcelFile(this.ds.tabs[this.ftn_uic][this.selTab], 'queryResults', 'excel');
  }
}
