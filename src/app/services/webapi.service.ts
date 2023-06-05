import {DatastoreService} from './datastore.service';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {throwError, Observable} from 'rxjs';
import {catchError, timeout} from 'rxjs/operators';
import {ConlogService} from '../modules/conlog/conlog.service';

const httpHeaders = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

const httpOpt = {
  headers: httpHeaders
};

@Injectable({
  providedIn: 'root'
})
export class WebapiService {
  systemUrl = 'assets/config.xml';

  constructor(private http: HttpClient, private ds: DatastoreService, private conlog: ConlogService) { }
  ngOnInit(): void { }

  // Error Handling
  private static errorHandler(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      console.log(error);
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      console.log(error);
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    alert(errorMessage);
    console.log(errorMessage);
    return throwError(errorMessage);
  }

  // This will identify which server is being targeted.
  identifyWSServer(): string {
    return this.ds.getWSAPI();
  }

  /*identifyAPIServerLocation(results: any): void {
    for (let i = 0; i < results.length; i++) {
      if (results[i].active) {
        this.ds.setWSAPI(results[i].url, results[i].location);
        if(results[i].location != 'local') this.ds.devMode = false;
        break;
      }
    }

    console.log('API Server URL is: ', this.identifyWSServer());
  }*/

  getSystemConfig() {
    const xml = new XMLHttpRequest();
    xml.open('GET', this.systemUrl, false);
    xml.send();

    const xmlData: any | null = xml.responseXML;
    const sys = xmlData.getElementsByTagName('system');
    for (let i = 0; i < sys.length; i++) {
      if (sys[i].getAttribute('active') === 'true') {
        return {type: sys[i].getAttribute('type'), path: sys[i].getAttribute('path') };
      }
    }
    return null;
  }

  getSessionToken(): Observable<any> {
    let fullDomain: string = this.identifyWSServer().split('/api')[0] + `/token`;
    this.conlog.log('Get session token: ' + fullDomain);
    const params = 'userName=sean.mcgill' + '&password=' + this.ds.getPassKey() + '&grant_type=password';

    return (this.http.post<any>(fullDomain, params)
      .pipe(catchError(WebapiService.errorHandler)));
  }

  ////////////////////////////////////////////////////////////// Beginning of the Web service calls
  getCommsCheck(): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/CheckAPIComms`;
    return (this.http.get<any>(fullDomain));
  }

  getFTNFromURF(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetFTNFromURF`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getFTNDetail(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetFTNDetailData`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getFTNFuture(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetFTNFuture`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getFTNLike(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetFTNLike`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getFTNMDIS(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetFTNMDIS`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMOB(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetFTNPlanning`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getFTNPrevious(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetFTNPrevious`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMMSMess(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMMSMess`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMMSMDIS(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMMSMDIS`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic).set('urf', 'null');
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getBridgeID(userid: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetBridgeID`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('userid', userid);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getJOPES(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetJOPES`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getOrderRecID(ftnuic: string, objtype: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + ((objtype === "ftn") ? `/GetOrderRecID` : `/GetOrdersUIC`);
    const params = new HttpParams().set('id', this.ds.getPassKey()).set(((objtype === "ftn") ? 'ftn' : 'uic'), ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getOrderStaffingRecID(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetOrderStaffingRecID`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getOrderHistory(recid: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetOrderHistory`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('recid', recid);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getAltUIC(ftnuic: string, attempt: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetAltUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic).set('attempt', attempt);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getAlternateLabel(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetAlternateLabel`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMovementHistory(ftnuic: string, recid: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMovementHistory`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic).set('recid', recid);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMovementLAD(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMovementLAD`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getGFMAP(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetGFMAP`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getGFMAPFTN(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetGFMAPFTN`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getJCRMRequirement(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetJCRMRequirement`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getJCRMFPNoms(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetJCRMFPNoms`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getJCRMJFPNoms(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetJCRMJFPNoms`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getJCRMNonStandard(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetJCRMNonStandard`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getJCRMAdHoc(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetJCRMAdHoc`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getIndividualByFTN(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetIndividualByFTN`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMARRSL1(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMARRSL1`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMARRSL2(ftnuic: string, type: string, sid: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMARRSL2`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic).set('type', type).set('sid', sid);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMARRSL3(ftnuic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMARRSL3`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('ftn', ftnuic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  //////////////////////////////////////////// MISC Web Services
  getMDISUser(userid: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMDISUser`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('userid', userid);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getUpdateMDISUser(userid: string, appName: string, valName: string, valTxt: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetUpdateMDISUser`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('userid', userid).set('appName', appName).set('valName', valName).set('valTxt', valTxt);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getDataGrid(dgName: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetDataGrid`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('dgName', dgName);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  //////////////////////////////////////////// UIC Web Services

  getUIC(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getUICPersonnel(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetUICPersonnel`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getUICEquipSupply(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetUICEquipSupply`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getUICEquipService(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetUICEquipService`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getUICTraining(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetUICTraining`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getPersonnelArms(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetPersonnelArms`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getPersonnelTotal(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetPersonnelTotal`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getCMDComment(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetCMDComment`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getRotationDwell(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetRotationDwell`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getRotationUIC(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetRotationUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getRotationDate(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetRotationDate`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getRotationBarchart(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetRotationBarchart`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getPersonnelRICDA(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetPersonnelRICDA`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getArforgen(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetArforgen`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getDwell(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetDwell`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getUICGFMap(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetUICGFMap`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getOrdersUIC(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetOrdersUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getJOPESUIC(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetJOPESUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getJOPESPUIC(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetJOPESPUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMOBUIC(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMOBUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMMSUICMess(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMMSUICMess`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getMDISUIC(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetMDISUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getITAP(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetITAP`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getITAPStr(uicstr: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetITAPStr`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uicstr);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getDRRSA(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetDRRSA`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getReadyOverall(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetReadyOverall`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getReadyRemarks(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetReadyRemarks`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getFMSWeb(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetFMSWeb`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getSAMAS(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetSAMAS`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getIndividualByUIC(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetIndividualByUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }

  getAOSByUIC(uic: string): Observable<any> {
    let fullDomain: string = this.identifyWSServer() + `/GetAOSByUIC`;
    const params = new HttpParams().set('id', this.ds.getPassKey()).set('uic', uic);
    return (this.http.get<any>(fullDomain, {params})
      .pipe(catchError(WebapiService.errorHandler)));
  }
}
