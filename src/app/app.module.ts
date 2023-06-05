/*
  Required Imports for FTN Lookup

    ng add @angular/material
    ng add @ng-bootstrap/ng-bootstrap
    npm i ngx-toast-notifications
    npm i xlsx
    npm i ag-grid-community
    npm i ag-grid-angular
    npm install @swimlane/ngx-charts
    npm install @types/file-saver
 */

// Common Modules and Components
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from "@angular/common";
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {HttpClientModule} from "@angular/common/http";
import {AgGridModule} from "ag-grid-angular";
import {ConlogModule} from "./modules/conlog/conlog.module";

// Custom Services
import {DatastoreService} from "./services/datastore.service";
import {CommService} from "./services/comm.service";
import {WebapiService} from "./services/webapi.service";
import {ExcelService} from "./services/excel.service";
import {ConlogService} from "./modules/conlog/conlog.service";

// Angular Material Modules
import {MatTabsModule} from "@angular/material/tabs";
import {MatCardModule} from "@angular/material/card";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTableModule} from "@angular/material/table";
import {MatDialogModule} from "@angular/material/dialog";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatButtonModule} from "@angular/material/button";

// Custom Components
import {BannerComponent} from "./components/banner/banner.component";
import {TabcontainerComponent} from "./components/tabcontainer/tabcontainer.component";
import {ConfirmDialogComponent} from "./dialogs/confirm-dialog/confirm-dialog.component";
import {PodComponent} from "./components/pod/pod.component";
import {JcrmDashComponent} from "./components/subtabs/jcrm-dash/jcrm-dash.component";
import {GfmapDashComponent} from "./components/subtabs/gfmap-dash/gfmap-dash.component";
import {OrdersDashComponent} from "./components/subtabs/orders-dash/orders-dash.component";
import {FredDashComponent} from "./components/subtabs/fred-dash/fred-dash.component";
import {JopesDashComponent} from "./components/subtabs/jopes-dash/jopes-dash.component";
import {MobDashComponent} from "./components/subtabs/mob-dash/mob-dash.component";
import {ReadyDashComponent} from "./components/subtabs/ready-dash/ready-dash.component";
import {MdisDashComponent} from "./components/subtabs/mdis-dash/mdis-dash.component";
import {MmsDashComponent} from "./components/subtabs/mms-dash/mms-dash.component";
import {RotateDashComponent} from "./components/subtabs/rotate-dash/rotate-dash.component";
import {MoveDashComponent} from "./components/subtabs/move-dash/move-dash.component";
import {ItapDashComponent} from "./components/subtabs/itap-dash/itap-dash.component";
import {DrrsaDashComponent} from "./components/subtabs/drrsa-dash/drrsa-dash.component";
import {HistorygridComponent} from "./components/subcomps/historygrid/historygrid.component";
import {RequirementComponent} from "./components/subcomps/requirement/requirement.component";
import {NotesComponent} from "./components/subcomps/notes/notes.component";
import {TabsComponent} from "./components/tabs/tabs.component";
import {NominationsComponent} from "./components/subcomps/nominations/nominations.component";
import {NonstandardComponent} from "./components/subcomps/nonstandard/nonstandard.component";
import {AdhocComponent} from "./components/subcomps/adhoc/adhoc.component";
import {PersonnelComponent} from "./components/subcomps/personnel/personnel.component";
import {SupplyComponent} from "./components/subcomps/supply/supply.component";
import {ServiceComponent} from "./components/subcomps/service/service.component";
import {TrainComponent} from "./components/subcomps/train/train.component";
import {CommentsComponent} from "./components/subcomps/comments/comments.component";
import {RotategridComponent} from "./components/subcomps/rotategrid/rotategrid.component";
import {RotateBarchartComponent} from "./components/subcomps/rotate-barchart/rotate-barchart.component";
import {RotateBarchartIconComponent} from "./components/subcomps/rotate-barchart-icon/rotate-barchart-icon.component";
import {FmswebDashComponent} from "./components/subtabs/fmsweb-dash/fmsweb-dash.component";
import {SamasDashComponent} from "./components/subtabs/samas-dash/samas-dash.component";
import {AosDashComponent} from "./components/subtabs/aos-dash/aos-dash.component";
import {IndividualOrderDashComponent} from "./components/subtabs/individual-order-dash/individual-order-dash.component";
import {ExportExcelComponent} from "./components/export-excel/export-excel.component";

@NgModule({
  declarations: [
    AppComponent,
    BannerComponent,
    TabcontainerComponent,
    ConfirmDialogComponent,
    PodComponent,
    JcrmDashComponent,
    GfmapDashComponent,
    FredDashComponent,
    OrdersDashComponent,
    JopesDashComponent,
    MobDashComponent,
    ReadyDashComponent,
    MdisDashComponent,
    MmsDashComponent,
    RotateDashComponent,
    MoveDashComponent,
    ItapDashComponent,
    DrrsaDashComponent,
    HistorygridComponent,
    RequirementComponent,
    NotesComponent,
    TabsComponent,
    NominationsComponent,
    NonstandardComponent,
    AdhocComponent,
    PersonnelComponent,
    SupplyComponent,
    ServiceComponent,
    TrainComponent,
    CommentsComponent,
    RotategridComponent,
    RotateBarchartComponent,
    RotateBarchartIconComponent,
    FmswebDashComponent,
    SamasDashComponent,
    AosDashComponent,
    IndividualOrderDashComponent,
    ExportExcelComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    NgbModule,
    NgxChartsModule,
    HttpClientModule,
    AgGridModule,
    NgxChartsModule,
    ConlogModule,
    MatTabsModule,
    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  providers: [
    DatastoreService,
    CommService,
    WebapiService,
    ExcelService,
    ConlogService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
