import {AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {DatastoreService} from '../../services/datastore.service';
import {ConfirmDialogService} from '../../dialogs/confirm-dialog/confirm-dialog.service';
import {CommService} from '../../services/comm.service';
import {ConlogService} from "../../modules/conlog/conlog.service";


@Component({
  selector: 'app-pod',
  templateUrl: './pod.component.html',
  styleUrls: ['./pod.component.css']
})
export class PodComponent implements OnInit, AfterViewInit {

  @Input() ftn_uic: string = "";
  @Input() tabName: string = "";
  @Input() uicData: any;
  @ViewChild('mainHolder', {read: ElementRef, static:false}) mainHolder: ElementRef | undefined;

  holderMaxHeight: number = -1;
  holderMaxWidth: number = -1;
  divPodDim: any = {width: null, height: null, widthOffSet: 10, heightOffSet: 20, titleHeight: 23};
  /*minPodSize: number = 300;*/

  pods: any = [];
  podStyle: any;
  podTitleStyle: any;
  podContentStyle: any;
  tempBoxDim: any = {};
  podsVisible: boolean = false;

  podArr: any = [];

  podJCRM: any = [
    {title: 'Requirement', name: 'req', atMax: false},
    {title: 'Notes', name: 'notes', atMax: false},
    {title: 'FP Nomination', name: 'fpnom', atMax: false},
    {title: 'JFP Nomination', name: 'jfpnom', atMax: false},
    {title: 'Non Standard Details', name: 'nonstand', atMax: false},
    {title: 'AdHoc Details', name: 'adhoc', atMax: false}
  ];

  podREADY: any = [
    {title: 'Personnel', name: 'personnel', atMax: false},
    {title: 'Equipment Supply', name: 'supply', atMax: false},
    {title: 'Equipment Serviceability', name: 'service', atMax: false},
    {title: 'Training Readiness', name: 'train', atMax: false},
    {title: 'Comments', name: 'comments', atMax: false}
  ];

  constructor(private ds: DatastoreService, private dialog: ConfirmDialogService, private comm: CommService, private conlog: ConlogService) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    // At this point we should know why TAB we are building, so populate the array based on that
    switch(this.tabName) {
      case "JCRM":
        this.podArr = this.podJCRM;
        break;
      case "READY":
        this.podArr = this.podREADY;
        break;
      default:
        this.dialog.acknowledge("Fatal Error in Pod", "The type of pod was not determined so this information will not display").then();
        break;
    }

    setTimeout(() => {
      this.calculatePageDims();
    }, .5 );
  }

  calculatePageDims() {
    this.conlog.log("calculatePageDimensionsForPods");
    // Set up and store the size of the available window
    this.ds.windowDims.width = window.innerWidth * .99;
    this.ds.windowDims.height = window.innerHeight - 250;

    this.holderMaxHeight = this.ds.windowDims.height;
    this.holderMaxWidth = this.ds.windowDims.width;

    // need to computer the size of the actual box
    let PPL: number = Math.ceil(this.podArr.length / ((this.podArr.length > 3) ? 2 : 1));
    let rowCnt: number = Math.ceil(this.podArr.length / PPL);

    /* ORIGINAL VERSION OF THE CALCULATION */
    //this.divPodDim.height = Math.floor((this.holderMaxHeight  - this.divPodDim.heightOffSet) / (this.podArr.length / 3)) - 10;
    //this.divPodDim.width = Math.floor((this.holderMaxWidth - this.divPodDim.widthOffSet) / (this.podArr.length / 2)) - 14;

    /* UPDATED VERSION OF THE SIZE CALCULATION */
    this.divPodDim.height = Math.floor((this.holderMaxHeight - (rowCnt + 1) * this.divPodDim.heightOffSet)) / rowCnt;
    this.divPodDim.width = Math.floor((this.holderMaxWidth - ((PPL + 3) * this.divPodDim.widthOffSet)) / PPL);

    this.ds.podDims.height = this.divPodDim.height;
    this.ds.podDims.width = this.divPodDim.width;

    // identify the dimensions of the individuals div box (pod)
    this.podStyle = { 'margin': '8px', 'width': this.divPodDim.width + 'px', 'height': this.divPodDim.height + 'px', 'position': 'relative', 'overflow': 'hidden', 'display':'inline-flex' };
    this.podTitleStyle = { 'width': this.divPodDim.width + 'px', 'height': (this.divPodDim.titleHeight - 2) + 'px', 'position': 'absolute', 'overflow': 'hidden' };
    this.podContentStyle = { 'margin-top': this.divPodDim.titleHeight + 'px', 'width': this.divPodDim.width + 'px',
      'height': (this.divPodDim.height - this.divPodDim.titleHeight) + 'px', 'position': 'absolute', 'overflow': 'auto' };

    this.pods = this.podArr;
    this.podsVisible = true;
  }

  activateSelected(index: number) {
    this.tempBoxDim.index = index;

    // @ts-ignore
    let div: HTMLElement = document.getElementById(this.podArr[index].name)

    //Set the height and width of the selected element
    if(this.podArr[index].atMax) {
      // Need to shrink back to normal
      div.style.height = this.tempBoxDim.height;
      div.style.width = this.tempBoxDim.width;
      this.podTitleStyle = this.tempBoxDim.innerTitleStyle;
      this.podContentStyle = this.tempBoxDim.innerContentStyle;

      //Show remaining Pods
      this.showHidePods(true);
      this.podArr[index].atMax = false;

      // Clear out the storage variable
      this.tempBoxDim = {};
    } else {
      // Need to enlarge to full size
      this.tempBoxDim.height = div.style.height;
      this.tempBoxDim.width = div.style.width;
      this.tempBoxDim.coords = div.getBoundingClientRect();
      this.tempBoxDim.innerTitleStyle = this.podTitleStyle;
      this.tempBoxDim.innerContentStyle = this.podContentStyle;

      // Hide remaining Pods
      this.showHidePods(false);

      // So now we can enlarge this box with hopes to return to this position when we reduce the size
      div.style.height = (this.holderMaxHeight * .97) + 'px';
      div.style.width = (this.holderMaxWidth * .98) + 'px';
      div.style.left = '0px';
      div.style.top = '0px';
      this.podTitleStyle = { 'width': div.style.width, 'height': (this.divPodDim.titleHeight - 2) + 'px', 'position': 'absolute', 'overflow': 'hidden' };
      this.podContentStyle = { 'margin-top': this.divPodDim.titleHeight + 'px', 'width': div.style.width,
        'height': ((this.holderMaxHeight * .97) - this.divPodDim.titleHeight) + 'px', 'position': 'absolute', 'overflow': 'auto' };
      this.podArr[index].atMax = true;
    }

    // Alter the pod that it has been activated  (allows for the content to expand its width)
    this.comm.podActivated.emit(this.podArr[index].atMax);
  }

  showHidePods(display: boolean){
    // This will display or hide the unselected pods
    for(let i = 0; i < this.podArr.length; i++) {
      if(i != this.tempBoxDim.index) { // @ts-ignore
        document.getElementById(this.podArr[i].name).style.display = (display) ? "inline-flex" : "none";
      }
    }
  }
}
