import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-train',
  templateUrl: './train.component.html',
  styleUrls: ['./train.component.css']
})
export class TrainComponent implements OnInit {
  @Input() uicData: any;
  @Input() ftn_uic: string;

  constructor() { }

  ngOnInit(): void {
  }

}
