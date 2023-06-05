import { Component, OnInit } from '@angular/core';
import {DatastoreService} from '../../services/datastore.service';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  bannerImg: string;
  version: string;

  constructor(private ds:DatastoreService) { }

  ngOnInit() {
    this.version = this.ds.getVersion();
    this.bannerImg = "assets/images/banner_" + this.ds.appMode + ".png";
  }
}
