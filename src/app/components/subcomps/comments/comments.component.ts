import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() uicData: any;
  @Input() ftn_uic: string;

  constructor() { }

  ngOnInit(): void {
  }

}
