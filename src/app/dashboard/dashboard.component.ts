import { Component, ViewChild } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MainModule } from '../main/main.module';
import { ChartComponent } from "../chart/chart.component";
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from '../service/api.service';
import Swal from 'sweetalert2';
import { StateService } from '../service/state.service';
import { CommonModule } from '@angular/common';
// Assumes you have jQuery available
declare var $: any; 


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MainModule,
    SidebarComponent,
    RouterLink,
    ChartComponent,
    CommonModule,
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  totalBalanceAmount:number = 0;
  asOnDate:string = '';
  folionumber:string = '';
  transexecuted:string = 'INPROCESS';
  transactionDetail: any[] = [];


  @ViewChild(ChartComponent) chartComponent!: ChartComponent;

  
  constructor(private apiService: ApiService, private stateService: StateService, private router: Router,) {}

  
  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  
  ngOnInit(): void {

    // window.addEventListener('beforeunload', (event) => {
    //   // This will show a generic confirmation dialog
    //   const confirmationMessage = 'Are you sure you want to leave?';
    //   event.returnValue = confirmationMessage; // Modern browsers require this
    //   return confirmationMessage; // For compatibility with older browsers
    // });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        $('#carouselExampleIndicators').carousel();
      }
    });
  


    this.loadingAlert('Processing your request...', 'Loading...'); // Pass a message to the loading alert
    this.folionumber = this.stateService.getAccountNumber();
    this.PortfolioSummary();
    this.portfolioAllocationDetail(); 
    this.getTransactionDetail(this.transexecuted);
  }
  


  chartData: any = {
    type: 'pie',
    data: {
      labels: [],
      datasets: [
        {
          labels: [],
          data: [],
          backgroundColor: ['#869628', '#800628', 'red', 'blue', 'lime', 'purple', 'orange', '#1C4E80', '#79c314', '#F06A25', 'magenta', '#D3D3D3'],
          borderWidth: 0,  // Set borderWidth to 0 to remove the white line
          hoverOffset: 10,
        },
      ],
    },
  };

  

  PortfolioSummary() {
    // const globalAuthToken = sessionStorage.getItem('globalAuthToken');
    const globalAuthToken = this.stateService.getGlobalAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Mbs645 ${globalAuthToken}`
    });
    
    const userid = this.stateService.getUserId();
    const folionumber = this.stateService.getAccountNumber();
    const portfolioSummaryPayload = { userid, folionumber };
    // console.log('Data being posted:', portfolioSummaryPayload, globalAuthToken);

    this.apiService.GetPortfolioSummary(portfolioSummaryPayload, headers).subscribe(
      (response: any) => {
        console.log('GetPortfolioSummary Response:', response);
        if (response) {
          this.totalBalanceAmount = response.totalBalanceAmount;
          this.asOnDate = response.asOnDate;
          setTimeout(() => {
            Swal.close();
          }, 1000);
        }
        else{
          this.loadingAlert('No Response', 'The server did not return any response.');
        }
      },
      (error: any) => {
        console.error('Error posting data', error);
        this.showErrorAlert(error.message);
      });
  }
  



  portfolioAllocationDetail() {
    // const globalAuthToken = sessionStorage.getItem('globalAuthToken');
    const globalAuthToken = this.stateService.getGlobalAuthToken();
    const headers = new HttpHeaders({
      'Authorization': `Mbs645 ${globalAuthToken}`
    });
    
    const userid = this.stateService.getUserId();
    const folionumber = this.stateService.getAccountNumber();
    const portfolioSummaryPayload = { userid, folionumber };    

    this.apiService.GetPortfolioAllocationDetail(portfolioSummaryPayload, headers).subscribe(
      (response: any) => {
        console.log('GetPortfolioAllocationDetail Response:', response);
        if (response) {          
          response.portfolioAllocation.forEach((allocation: any) => {
            this.chartData.data.labels.push(allocation.fundShortName + ' - '+ allocation.navDate);
            this.chartData.data.datasets[0].data.push(allocation.availableAmount);
            this.chartData.data.datasets[0].labels.push(allocation.fundName);
          });
          
          this.chartComponent.updateChart();
          setTimeout(() => {
            // Trigger Update Chart
            Swal.close();
          }, 1000);
        }
        else if (response == null) {
          this.transactionDetail = [];
          setTimeout(() => {
            Swal.close();
          }, 1000);
        }
        else{
          this.loadingAlert('No Response', 'The server did not return any response.');
        }
      },
      (error: any) => {
        console.error('Error posting data', error);
        this.showErrorAlert(error.message);
      });
  }
    



  getTransactionDetail(transexecuted: string) {
    this.loadingAlert('Processing your request...', 'Loading...'); // Pass a message to the loading alert
    // const globalAuthToken = sessionStorage.getItem('globalAuthToken');
    const globalAuthToken = this.stateService.getGlobalAuthToken();

    const headers = new HttpHeaders({
      'Authorization': `Mbs645 ${globalAuthToken}`
    });
    
    const userid = this.stateService.getUserId();
    const folionumber = this.stateService.getAccountNumber();
    const portfolioSummaryPayload = { userid, folionumber, transexecuted };    
    // console.log('Data being posted:', portfolioSummaryPayload, globalAuthToken);
    
    this.apiService.GetTransactionDetail(portfolioSummaryPayload, headers).subscribe(
      (response: any) => {
        console.log('GetTransactionDetail Response:', response);
        if (response) {
          this.transactionDetail = [];
          response.transList.forEach((allocation: any) => {
            if (!allocation.transDate) allocation.transDate = 'null';
            if (!allocation.fundName) allocation.fundName = 'null';
            if (!allocation.transType) allocation.transType = 'null';
            if (!allocation.units) allocation.units = 'null';
            if (!allocation.amount) allocation.amount = 'null';
            this.transactionDetail.push(allocation);
          });
            
          setTimeout(() => {
            Swal.close();
          }, 1000);
        }
        else if (response == null) {
          this.transactionDetail = [];
          setTimeout(() => {
            Swal.close();
          }, 1000);
        }
        else {
          this.loadingAlert('No Response', 'The server did not return any response.');
        }
      },
      (error: any) => {
        console.error('Error posting data', error);
        this.showErrorAlert(error.message);
      });
  }



  loadingAlert(swalText: string, swalTitle: string) {
    const style = document.createElement('style'); style.innerHTML = `div.swal2-icon { border: none !important;}`;
    document.head.appendChild(style);
    Swal.fire({
      title: swalTitle,
      text: swalText,
      iconHtml: '<i class="fa-solid fa-spinner fa-spin-pulse" style="color: #ff7b00;"></i>',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  }
  
  
  
  showErrorAlert(errorTittle:string) {
    Swal.fire({
      icon: 'error',
      title: 'Failed',
      text: errorTittle,
    });
  }


}
