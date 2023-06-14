import { Component, ElementRef, HostListener } from '@angular/core';
import { DatastoreService } from './services/datastore.service';
import { WebapiService } from './services/webapi.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmDialogService } from './dialogs/confirm-dialog/confirm-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { LogConsoleDialogComponent } from './modules/conlog/log-console-dialog/log-console-dialog.component';
import { ConlogService } from './modules/conlog/conlog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ftnlookup';
  enabled:boolean = false;
  params: any = {ftn: null, uic: null};
  inbound: any = {ftn: null, uic: null};
  isConsoleOpen: boolean = false;
  dialogQuery: any;
  dataErrMsg: any = [];
  glbErrMsg: string = "";

  // Adding global host listener for single global keyboard command of CTRL+\
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(event.ctrlKey && event.code == "KeyY") {
      // A request to open the logging console has been executed
      if(!this.isConsoleOpen) {
        this.isConsoleOpen = true;
        this.dialogQuery = this.dialog.open(LogConsoleDialogComponent, {
          width: '650px',
          height: '870px',
          autoFocus: false,
          position: { right: '20px', top: '10px'}
        });

        this.dialogQuery.afterClosed().subscribe(() => {
          this.isConsoleOpen = false;
        });
      } else {
        // close the window, but keep the information.
        this.dialogQuery.close();
      }
    }
  }

  constructor(private ds: DatastoreService, private api: WebapiService, private cds: ConfirmDialogService, elRef: ElementRef, private conlog:
    ConlogService,public dialog: MatDialog) {
    // Get any information that is available in the querystring
    this.inbound.ftn = elRef.nativeElement.getAttribute('ftn');
    this.inbound.uic = elRef.nativeElement.getAttribute('uic');
  }

  ngOnInit() {
    this.conlog.log("ngOnInit");

    //During initialization, need to identify which server is hosting the latest API.
    this.inbound.ftn = this.processInboundData(this.inbound.ftn);
    this.inbound.uic = this.processInboundData(this.inbound.uic);

    // Set up for local execution and development only (This is automatically ignored if data is passed to the querystring)
    //this.ds.devMode = true;     // This is for debugging without running locally only
    if (this.inbound.ftn == null && this.inbound.uic == null && this.ds.devMode) {
      //this.inbound.ftn = 'DEMO1201000';  // DEMO1111782  DEMO1141930  DEMO1201038  DEMO1171444 DEMO1201000
      this.inbound.uic = 'ZPFLAA'; // Z48JAA
    } else this.ds.devMode = false;

    // Validate the provided values.
    this.conlog.log("Validation Start - InBound FTN is [" + this.inbound.ftn + "] | UIC is [" + this.inbound.uic + "]");
    if(this.inbound.ftn != null) {  // Check FTN
      this.params.ftn = (this.inbound.ftn.length == 11) ? this.inbound.ftn : null;
      if(this.params.ftn == null && !this.ds.devMode)
        this.dataErrMsg.push("The FTN is not 11 characters. Please verify and try again.");
    }

    if(this.inbound.uic != null) {  // Check UIC
      this.params.uic = (this.inbound.uic.length >= 4 && this.inbound.uic.length <= 6) ? this.inbound.uic : null;
      if(this.params.uic == null && !this.ds.devMode)
        this.dataErrMsg.push("The UIC is not between 4 and 6 characters. Please verify and try again.");
    }

    this.conlog.log("Validation Complete - PARAMS FTN is [" + this.params.ftn + "] | UIC is [" + this.params.uic + "]");

    // Set the development mode
    //if(this.params.ftn != null || this.params.uic != null) this.ds.devMode = false;   // Set dev mode to false if anything is passed
    this.conlog.log("Values to be used - FTN: " + this.params.ftn + " or UIC: " + this.params.uic);

    if (this.ds.getWSAPI() == '') {
      this.getSystemConfig();
      this.validateAPI();

      /* TODO  -  During initialization, also need to obtain the authorization token that will be used for all communications (Still not working correctly) */
      //this.grabToken();

      if(this.dataErrMsg.length > 0) {
        alert(this.dataErrMsg.join("\r\n"));
      } else if (this.params.ftn == null && this.params.uic == null && !this.ds.devMode) {
        this.glbErrMsg = "FATAL ERROR: System Halted! Missing critical FTN/UIC data. Return to MDIS and try again.";
      } else {
        // We have the information we need, and it is formatted correctly.
        this.conlog.log("Dev Mode: " + this.ds.devMode + ", FTN:" + this.params.ftn + ", UIC:" + this.params.uic);

        // Establish AppMode - FTN is the default mode if both are provided
       (this.params.uic != null && this.params.ftn == null) ? this.ds.appMode = 'uic' : this.ds.appMode = 'ftn';

        // Grab the querystring information, this should be the FTN or UIC
        if (this.ds.appMode == 'ftn') {
          this.ds.tabs[this.params.ftn] = {};
          this.ds.tabs[this.params.ftn] = {ftn_uic: this.params.ftn, type: 'ftn', index: 0};
        } else if (this.ds.appMode == 'uic') {
          this.ds.tabs[this.params.uic] = {};
          this.ds.tabs[this.params.uic] = {ftn_uic: this.params.uic, type: 'uic', index: 0};
        } else {
          this.glbErrMsg = "FATAL ERROR: Data Failure. Unable to continue. Return to MDIS and try again.";
        }
      }
    }
  }

  processInboundData(data: string): any{
    this.conlog.log("processInboundData - incoming - " + data);

    if(data == null) return null;

    if(data.indexOf("&") > -1 || data.indexOf("=") > -1) {
      let dataEle: string[] = data.split("&");
      data = (dataEle[0].indexOf("=") > -1) ? dataEle[0].substring(dataEle[0].indexOf("=")+1) : dataEle[0];
    }

    this.conlog.log("processInboundData - outgoing - " + data);
    return data;
  }

  getSystemConfig() {
    // Collect the information from the config.xml file and set the appropriate database location
    this.conlog.log("getSystenConfig");
    const results: any = this.api.getSystemConfig();
    this.ds.setWSAPI(results.path, results.type);
    this.ds.devMode = (results.type === "local");
  }

  validateAPI() {
    //Make sure the API is available before we start attempting to load anything
    this.conlog.log("validateAPI");
    this.api.getCommsCheck()
      .subscribe((results) => {
        if(results == "Comms Successful - LKUP") {
          this.enabled = true;  // Allow the tab sections to be displayed
          this.ds.apiCommCheckPassed = true;
          this.conlog.log("Comms Connection Successful - LKUP");
        }
      },
        error => {
          console.log("Getting error from token grab", error);
          this.cds.acknowledge('Fatal Error', 'Unable to connect to API. Please verify operation. Program Halted').then(r => {});
          this.ds.apiCommCheckPassed = false;
          this.enabled = false;
          this.conlog.log("Comms Connection Unsuccessful - LKUP");
        });

    this.conlog.log("the API is located at: " + this.ds.getWSAPI());
  }

  private async grabToken() {
    if (localStorage.getItem('token') == 'null') {
      console.log("Grab a bearer token");
      await this.api.getSessionToken()
        .subscribe(
          (results: any) => {
            localStorage.setItem('token', results.access_token);
            console.log('Got the new token', results.access_token);
          },
          (err: HttpErrorResponse) => {
            console.log("Getting error from token grab", err.message);
          });

      //Token bypass just to keep it operating
      localStorage.setItem("key", this.ds.getPassKey());
    }
  }
}
