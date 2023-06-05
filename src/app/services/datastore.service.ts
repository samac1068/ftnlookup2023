import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class DatastoreService {

  // Variables
  private _passKey: string = "4A3F6BD3-61FB-467B-83D0-0EFBAF72AFC4";
  //private _connectid: string  = 'MobCopConnectionString';
  private _appVersion: string = '3.1.23.0605';
  private _apiServer: string = "";
  private _apiLocation: string = "";

  // Public Variables
  tabs: any = {};       // This is where everything is going to be stored
  columnDefinitions: any = [];
  apiCommCheckPassed: boolean = false;
  appMode: string = "ftn";  // Indicates whether we are looking with FTN or UIC
  devMode: boolean = false;  //Indicates that we are currently in development mode
  windowDims: any = {};
  podDims: any = {};

  /// Ag-grid Column Definition and Configuration Section
  defaultHeaderHt: number = 30;
  defaultRowHt: number = 22;

  defaultColDef: any = {
    flex: 1,
    wrapText: false,
    autoHeight: true,
    sortable: true,
    resizable: false,
  }

  globalColDefine: any = [
    ["resizable", true],
    ["cellStyle", {"border-right" :  "1px solid #eee"}]
  ]

  // Global Getters and Setters
  getPassKey() {
    return this._passKey;
  }

  getVersion() {
    return this._appVersion;
  }

  getWSAPI() {
    return this._apiServer;
  }

  setWSAPI(url: string, location: string) {
    this._apiServer = url;
    this._apiLocation = location;
  }

  ///////////////////////////////  Common Functions ///////////////////////////////
  isAllObjTrue(obj: any) {
    for (let o in obj)
      if(!obj[o]) return false;

    return true;
  }

  whatObjRemains(obj: any) {
    let objStr: string = "";

    for(let o in obj){
      if(!obj[o]) {
        objStr += ((objStr.length == 0) ? "" : ", ") + this.capitalizeWord(o);
      }
    }

    return objStr;
  }

  resetAllObj(obj: any) {
    for (let o in obj)
      obj[o] = false;
  }

  isNull(o: Object):Boolean
  {
    return (o == null || false);
  }

  capitalizeWord(word: string) {
    return word.substr(0,1).toUpperCase() + word.substr(1, word.length).toLowerCase();
  }

  setDateFormatFromString(dateStr: any, format: string ="mm/dd/yyyy")
  {
    let d: Date;

    if(dateStr == null || this.isNull(dateStr))
      return null;
    else
      d = new Date(dateStr);

    if(d.getFullYear() > 2000)
      return this.setDateFormat(d, format);
    else return null;
  }

  setDateFormat(d: Date, format: string ="mm/dd/yyyy")
  {
    //This will return a specific string format for the incoming date
    let monthArr:any = ["January","February","March","April","May","June","July","August", "September","October","November","December"];
    let newDateFormat:String = "";

    // If null or undefined, then return null
    if(this.isNull(d)) return "";

    if(d.getFullYear() != 1900)
    {
      switch(format)
      {
        case "mm/dd/yyyy":
          newDateFormat = this.setDoubleDigits(d.getMonth()+1) + "/" + this.setDoubleDigits(d.getDate()) + "/" + d.getFullYear();
          break;
        case "mm/dd/yy":
          newDateFormat = this.setDoubleDigits(d.getMonth()+1) + "/" + this.setDoubleDigits(d.getDate()) + "/" + String(d.getFullYear()).substring(2,4);
          break;
        case "MMM dd, yyyy":
          newDateFormat = monthArr[d.getMonth()].substring(0,3) + " " + this.setDoubleDigits(d.getDate()) + ", " + d.getFullYear();
          break;
        case "dd MONTH yyyy":
          newDateFormat = this.setDoubleDigits(d.getDate()) + " " + monthArr[d.getMonth()] + " " + d.getFullYear();
          break;
        case "dd MMM yyyy":
          newDateFormat = this.setDoubleDigits(d.getDate()) + " " + monthArr[d.getMonth()].substring(0,3) + " " + d.getFullYear();
          break;
        case "dd MMM yy":
          newDateFormat = this.setDoubleDigits(d.getDate()) + " " + monthArr[d.getMonth()].substring(0,3) + " " + String(d.getFullYear()).substring(2,4);
          break;
      }
    }

    return newDateFormat
  }

  setDoubleDigits(n:Number)
  {
    return (n < 10)? "0" + n.toString() : n.toString();
  }

  calculateColWidths(gridName: string) {
    let divActualWidth = window.innerWidth * .98;   // Represents the size of the DIVs for the messages
    let divComputedWidth = 0;
    let noWidthCol: number = 0;
    let v: number;

    let subArr = this.columnDefinitions[gridName];

    // Modify the subarr
    for(v = 0; v < subArr.length; v++) {
      if(subArr[v]["visible"] != undefined) {
        if(!subArr[v]["visible"]) {
          subArr.splice(v, 1);
          v--;
        }
      }
    }

    // Computer the total width used and the number of columns without a provided width
    for(v =0; v < subArr.length; v++) {
      if(subArr[v]["width"] == -1)
        noWidthCol++;
      else
        divComputedWidth+= subArr[v]["width"];
    }

    if(noWidthCol > 0) {
      // Based on what is available and the number of columns, determine the new width
      let colWidth:number = ((divActualWidth - divComputedWidth) / noWidthCol) - 5;

      // Now update the variables with the new value
      for(v = 0; v < subArr.length; v++){
        if(subArr[v]["width"] == -1)
          subArr[v]["width"] = colWidth;
      }
    }

    //return subArr;
  }

  searchArrFor(str: string, arr: any): boolean {
    if(arr == undefined || str.length == 0) return false;

    for(let i = 0; i < arr.length; i++) {
      if(arr[i] == str) return true;
    }

    return false;
  }

  searchArrObjFor(value: string, arr: any, col: string): boolean {
    if(arr == undefined || col.length == 0 || value.length == 0) return false;

    for(let i = 0; i < arr.length; i++) {
      if(arr[col] == value) return true;
    }

    return false;
  }

  getIndexOf(value: any, arr: any): number {
    for(let i = 0; i < arr.length; i++) {
      if(arr[i] == value)
        return i;
    }

    return -1;
  }

  setColumnGlobals(tbl:string): any {
    if(this.columnDefinitions[tbl] != undefined) {
      for (let col = 0; col < this.columnDefinitions[tbl].length; col++) {
        for (let a = 0; a < this.globalColDefine.length; a++) {
          this.columnDefinitions[tbl][col][this.globalColDefine[a][0]] = this.globalColDefine[a][1];
        }
      }
    }
  }

  monthDiff(d1: Date, d2: Date): number {
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
  }
}
