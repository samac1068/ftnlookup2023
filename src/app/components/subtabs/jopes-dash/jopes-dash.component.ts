import {Component, Input, OnInit, AfterViewInit} from '@angular/core';
import {DatastoreService} from '../../../services/datastore.service';
import {CommService} from '../../../services/comm.service';
import {WebapiService} from '../../../services/webapi.service';
/*import {HttpClient} from '@angular/common/http/http';*/
import {ConlogService} from '../../../modules/conlog/conlog.service';

@Component({
  selector: 'app-jopes-dash',
  templateUrl: './jopes-dash.component.html',
  styleUrls: ['./jopes-dash.component.css']
})
export class JopesDashComponent implements OnInit {
  @Input() ftn_uic: string;
  columnDefs: any = [];
  unsortedArr: any =[];
  rowData: any;

  jopesNoRecord: boolean = true;
  jopesTimeOut: boolean = false;
  jopesTabLoaded: boolean = false;

  constructor(public ds: DatastoreService, private comm: CommService, private api: WebapiService, private conlog: ConlogService) { }

  ngOnInit(): void {
    this.ds.tabs[this.ftn_uic]["JOPES"] = {};
    this.ds.tabs[this.ftn_uic]["JOPES"]["PID_LIST"] = [];
    this.ds.tabs[this.ftn_uic]["JOPES"]["DATA"] = {};

    // Used for local development only
    /*this.rowData = [
      {'ULN': 'U7TM302',	'PID': 'C19D2',	'UIC': 'ZB09AA', 'ANAME':'0088 UNIT NAME AA', 'FORCEDESC':'NULL', 'SSF':'NULL', 'UTC':'NULL', 'PAX':2, 'DEST':'NULL', 'CAL_LAD':'2020-05-01 00:00:00.000','CAL_LAD_STR':'05/01/2020','LAD':'NULL', 'RLD':'NULL', 'BASELINE':'DEMO1201038','TOTALSTONS':0},
      {'ULN': 'U7TM502',	'PID': 'C19D2',	'UIC': 'ZB09AA', 'ANAME':'0088 UNIT NAME AA', 'FORCEDESC':'NULL', 'SSF':'NULL', 'UTC':'NULL', 'PAX':10, 'DEST':'NULL', 'CAL_LAD':'2020-05-01 00:00:00.000','CAL_LAD_STR':'05/01/2020','LAD':'NULL', 'RLD':'NULL', 'BASELINE':'DEMO1201038','TOTALSTONS':0},
      {'ULN': 'U7TM402',	'PID': 'C5ER5',	'UIC': 'ZAHDFF', 'ANAME':'0170 UNIT NAME AA', 'FORCEDESC':'NULL', 'SSF':'NULL', 'UTC':'NULL', 'PAX':7, 'DEST':'NULL', 'CAL_LAD':'2019-10-01 00:00:00.000','CAL_LAD_STR':'10/01/2019','LAD':'NULL', 'RLD':'NULL', 'BASELINE':'DEMO1201038','TOTALSTONS':0},
      {'ULN': 'CEA0002',	'PID': 'C5ER5',	'UIC': 'ZAHDFF', 'ANAME':'0170 UNIT NAME AA', 'FORCEDESC':'NULL', 'SSF':'NULL', 'UTC':'NULL', 'PAX':101, 'DEST':'NULL', 'CAL_LAD':'2019-10-01 00:00:00.000','CAL_LAD_STR':'10/01/2019','LAD':'NULL', 'RLD':'NULL', 'BASELINE':'DEMO1201038','TOTALSTONS':0},
      {'ULN': 'CEA0022',	'PID': 'C5ER5',	'UIC': 'ZAHDFF', 'ANAME':'0170 UNIT NAME AA', 'FORCEDESC':'NULL', 'SSF':'NULL', 'UTC':'NULL', 'PAX':101, 'DEST':'NULL', 'CAL_LAD':'2019-10-01 00:00:00.000','CAL_LAD_STR':'10/01/2019','LAD':'NULL', 'RLD':'NULL', 'BASELINE':'DEMO1201038','TOTALSTONS':0},
      {'ULN': 'CEA0032',	'PID': 'C5ER5',	'UIC': 'ZAHDFF', 'ANAME':'0170 UNIT NAME AA', 'FORCEDESC':'NULL', 'SSF':'NULL', 'UTC':'NULL', 'PAX':198, 'DEST':'NULL', 'CAL_LAD':'2019-10-01 00:00:00.000','CAL_LAD_STR':'10/01/2019','LAD':'NULL', 'RLD':'NULL', 'BASELINE':'DEMO1201038','TOTALSTONS':0},
      {'ULN': 'CEA0042',	'PID': 'C5ER5',	'UIC': 'ZAHDFF', 'ANAME':'0170 UNIT NAME AA', 'FORCEDESC':'NULL', 'SSF':'NULL', 'UTC':'NULL', 'PAX':140, 'DEST':'NULL', 'CAL_LAD':'2019-10-01 00:00:00.000','CAL_LAD_STR':'10/01/2019','LAD':'NULL', 'RLD':'NULL', 'BASELINE':'DEMO1201038','TOTALSTONS':0},
      {'ULN': 'CEA0052',	'PID': 'C5ER5',	'UIC': 'ZAHDFF', 'ANAME':'0170 UNIT NAME AA', 'FORCEDESC':'NULL', 'SSF':'NULL', 'UTC':'NULL', 'PAX':140, 'DEST':'NULL', 'CAL_LAD':'2019-10-01 00:00:00.000','CAL_LAD_STR':'10/01/2019','LAD':'NULL', 'RLD':'NULL', 'BASELINE':'DEMO1201038','TOTALSTONS':0},
      {'ULN': 'CEA0062',	'PID': 'C5ER5',	'UIC': 'ZAHDFF', 'ANAME':'0170 UNIT NAME AA', 'FORCEDESC':'NULL', 'SSF':'NULL', 'UTC':'NULL', 'PAX':30, 'DEST':'NULL', 'CAL_LAD':'2019-10-01 00:00:00.000','CAL_LAD_STR':'10/01/2019','LAD':'NULL', 'RLD':'NULL', 'BASELINE':'DEMO1201038','TOTALSTONS':0}
    ];*/

    this.ds.calculateColWidths("jopes");
    this.ds.setColumnGlobals("jopes");
    this.getJopesData();
  }

  getJopesData() {
    // For local development only
    //this.unsortedArr = this.rowData;
    //this.processJopesData();

    this.api.getJOPES(this.ftn_uic).subscribe(result => {
      if(result.indexOf("Execution Timeout Expired") == -1) {
        this.unsortedArr = result;
        this.processJopesData();
      } else {
        this.jopesTimeOut = true;
        this.completeJopesProcess();
      }
    });
  }

  processJopesData(){
    // Need to group the information
    let arrShtct:any = this.ds.tabs[this.ftn_uic]["JOPES"];

    for(let i = 0; i < this.unsortedArr.length; i++) {
      if(arrShtct["DATA"][this.unsortedArr[i]["PID"]] == undefined) {
        arrShtct["DATA"][this.unsortedArr[i]["PID"]] = [];
        arrShtct["PID_LIST"].push(this.unsortedArr[i]["PID"]);
      }

      //Load the variable with the information
      arrShtct["DATA"][this.unsortedArr[i]["PID"]].push(this.unsortedArr[i]);
    }

    this.completeJopesProcess();
  }

  completeJopesProcess() {
    this.jopesTabLoaded = true;
    this.jopesNoRecord = (this.ds.tabs[this.ftn_uic]["JOPES"]["PID_LIST"] == 0);
    this.conlog.log("jopes has been loaded.");
  }

  colValueChanged(ind: number, pid: string, col: string): string {
    if (ind > 0) {
      let arr: any = this.ds.tabs[this.ftn_uic]["JOPES"]["DATA"][pid];
      return (arr[ind][col] !== arr[ind - 1][col] ? 'cellHighlight': 'cellNoHighlight');
    }  else return 'cellNoHighlight';
  }
}
