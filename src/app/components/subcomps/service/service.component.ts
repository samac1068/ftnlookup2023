import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {
  @Input() uicData: any;
  @Input() ftn_uic: string;

  constructor() { }

  ngOnInit(): void {
  }

}
