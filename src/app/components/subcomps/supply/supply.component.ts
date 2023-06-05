import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-supply',
  templateUrl: './supply.component.html',
  styleUrls: ['./supply.component.css']
})
export class SupplyComponent implements OnInit {
  @Input() uicData: any;
  @Input() ftn_uic: string;

  constructor() { }

  ngOnInit(): void {
  }

}
