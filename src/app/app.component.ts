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
  params: any = [];
  isConsoleOpen: boolean = false;
  dialogQuery: any;

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

  constructor(private ds: DatastoreService, private api: WebapiService, private cds: ConfirmDialogService, elRef: ElementRef, private conlog: ConlogService, public dialog: MatDialog) {
    // Get any information that is available in the querystring
    this.params.ftn = !this.validateInBoundData() ? elRef.nativeElement.getAttribute('ftn') : null;
    this.params.uic = !this.validateInBoundData() ? elRef.nativeElement.getAttribute('uic') : null;

    if(this.params.ftn != null || this.params.uic != null) this.ds.devMode = false;   // Set dev mode to false if anything is passed
    this.conlog.log("Values coming from QueryRequest - FTN: " + this.params.ftn + " UIC: " + this.params.uic);
  }

  ngOnInit() {
    //During initialization, need to identify which server is hosting the latest API.
    this.conlog.log("ngOnInit - Determine where we are");

    if (this.ds.getWSAPI() == '') {
      this.getSystemConfig();
      this.validateAPI();

      /*TODO*/
      // During initialization, also need to obtain the authorization token that will be used for all communications (Still not working correctly)
      //this.grabToken();

      //this.ds.devMode = true;     // This is for debugging without running locally only

      if (this.params.ftn == null && this.params.uic == null && !this.ds.devMode) {
        alert("FATAL ERROR: System Halted! Missing critical FTN/UIC information. Return to MDIS and try again.");
      } else {
        // Set up for local execution and development only (This is automatically ignored if data is passed to the querystring)
        if (this.params.ftn == null && this.params.uic == null && this.ds.devMode) {
          //this.params.ftn = 'DEMO1201038';  // DEMO1111782  DEMO1141930  DEMO1201038  DEMO1171444
          this.params.uic = 'ZPFLAA'; // Z48JAA
        }

        // Are we running locally or on a server?  On a server, then devMode should be false regardless if testing
        this.conlog.log("Dev Mode: " + this.ds.devMode + ", FTN:" + this.params.ftn + ", UIC:" + this.params.uic);

        // Establish AppMode - FTN is the default mode if both are provided
       (this.params.uic != null && this.params.ftn == null) ? this.ds.appMode = 'uic' : this.ds.appMode = 'ftn';
      }

      // Grab the querystring information, this should be the FTN or UIC
      if (this.params.ftn != null) {
        this.ds.tabs[this.params.ftn] = {};
        this.ds.tabs[this.params.ftn] = {ftn_uic: this.params.ftn, type: 'ftn', index: 0};
      } else if (this.params.uic != null) {
        this.ds.tabs[this.params.uic] = {};
        this.ds.tabs[this.params.uic] = {ftn_uic: this.params.uic, type: 'uic', index: 0};
      } else {
        alert("FATAL ERROR: Missing critical FTN/UIC data.  Unable to continue.");
      }
    }
  }

  validateInBoundData():boolean {
    if(this.params.ftn != null)
      return (this.params.ftn.length != 11 || (this.params.ftn.toLowerCase().indexOf("0c0") == -1 && !this.ds.devMode));

    if(this.params.uic != null)
      return ((this.params.uic.length >= 4 && this.params.uic.length <= 6) || (this.params.uic.toLowerCase().indexOf(this.ds.devMode?"z":"w") == -1));

    return false;
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
          this.cds.acknowledge('Fatal Error', 'Unable to connect to API. Please verify operation. Program Halted');
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
