import {Component, Input, OnInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';

@Component({
  selector: 'app-rotate-barchart-icon',
  templateUrl: './rotate-barchart-icon.component.html',
  styleUrls: ['./rotate-barchart-icon.component.css']
})
export class RotateBarchartIconComponent implements OnInit {
  @Input() rowData: any;
  @Input() yearStart: number = -1;
  @Input() qtrWidth: number= -1;

  iconWidth: number = 10;    // Setting a minimum width.  Height is established and static.
  iconLeft: number = 0;
  startdt: any;
  enddt: any;

  qtrBrkDown: any = [[[1,2,3], 2], [[4,5,6], 3], [[7,8,9], 4], [[10,11,12], 1]];

  constructor(private ds: DatastoreService) { }

  ngOnInit(): void {
    // When info is collected, need to calculate the width of this icon based on the total number of qtrs * 50px
    this.startdt = this.rowData.startdate.split('/');   // 0 = month; 1 = date; 2 = year
    this.enddt = this.rowData.enddate.split('/');       // 0 = month; 1 = date; 2 = year

    // Determine how far left this icon will start;
    this.iconLeft = this.getIconStartPosition();
    this.iconWidth = this.getIconLength();
  }

  getQuarter(comp: any) {
    let yr: number = comp[2];
    for(let p = 0; p < this.qtrBrkDown.length; p++) {
      const found = this.qtrBrkDown[p][0].find((ele: any) => ele == comp[0]);
      if(found) {
        let index = this.ds.getIndexOf(comp[0], this.qtrBrkDown[p][0]);
        if(this.qtrBrkDown[p][1] === 1)
          yr = (comp[2]*1) + 1;
        return { qtr: this.qtrBrkDown[p][1], index: index, yr: Number(yr) };
      }
    }

    return { qtr: 0, index: -1, yr: Number(yr) };
  }

  getIconStartPosition() {
    let getQtr:any = this.getQuarter(this.startdt);
    let ltPos = (Math.ceil(getQtr.yr - this.yearStart) * 79) + ((getQtr.qtr - 1) * 19.75); // Move to the start of the appropriate year this.qtrWidth
    ltPos = ltPos + (6.70 * getQtr.index);                                                    // Adjust the start point based on the month
    return ltPos;
  }

  getIconLength() {
    /* Calculation based on number of actual months between start date and end date */
    let yrDiff = Number(this.enddt[2]) - Number(this.startdt[2]) - 1;
    let numMonths = (12 - Number(this.startdt[0]) + Number(this.enddt[0])) + (yrDiff * 12) - 1;
    let numQtr = Math.floor(numMonths / 3);
    let monOffset = Math.ceil((Number(this.enddt[0])%3) * .333);
    return (numQtr * this.qtrWidth) + monOffset;
    //return iconLen;
  }
}
