import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';

@Component({
  selector: 'app-rotategrid',
  templateUrl: './rotategrid.component.html',
  styleUrls: ['./rotategrid.component.css']
})
export class RotategridComponent implements OnInit {
  @Input() uicData: any;

  headerHeight: number = 30;

  // Column Definitions
  uicColumnDef: any[] = [{headerName: 'UIC', field: 'uic6'}, {headerName: 'ANAME',field:'aname'}, {headerName: 'CMP',field: 'cmp'},
    {headerName: 'SCR',field: 'src'}, {headerName: 'BRANCH',field: 'branch'}, {headerName: 'MTOE AUTH',field: 'mtoeauth'}];

  dateColumnDef: any[] = [{ headerName: 'UIC', field: 'uic', width: 100 }, { headerName: 'OP',field:'operation', width: 150 }, { headerName: 'PAX',field: 'pax', width: 100 },
    { headerName: 'START DATE',field: 'startdate', width: 160 }, { headerName: 'END DATE',field: 'enddate', width: 160 }];

  dwellColumnDef: any[] = [{headerName: 'DWELL PERIOD', field: 'period', width: 150}, {headerName: '< 180',field:'under_180', width: 100}, {headerName: '181 - 365',field: 'under_365', width: 100},
    {headerName: '366 - 545',field: 'under_545', width: 100}, {headerName: '546 - 730',field: 'under_730', width: 100}, {headerName: '> 730',field: 'over_730', width: 100},
    {headerName: 'Total',field: 'totalDwell', width: 100}];

  constructor(public ds: DatastoreService) { }

  ngOnInit(): void {


  }
}
