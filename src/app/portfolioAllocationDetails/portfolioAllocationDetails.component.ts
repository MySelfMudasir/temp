import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from '../service/state.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MainModule } from '../main/main.module';
import { HttpHeaders } from '@angular/common/http';
import { ApiService } from '../service/api.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-portfolioAllocationDetails',
  standalone: true,
  imports: [
    MainModule,
    SidebarComponent,
    CommonModule
  ],
  templateUrl: './portfolioAllocationDetails.component.html',
  styleUrl: './portfolioAllocationDetails.component.css'
})
export class PortfolioAllocationDetailsComponent implements OnInit {
  totalBalanceAmount: string = '';
  portfolioAllocation: any[] = [];

  constructor(private apiService: ApiService, private stateService: StateService, private router: Router) {}

  ngOnInit() {
    this.loadingAlert('Processing your request...', 'Loading...'); // Pass a message to the loading alert
    this.portfolioAllocationDetail();
  }




  portfolioAllocationDetail() {
    const globalAuthToken = sessionStorage.getItem('globalAuthToken');
    const headers = new HttpHeaders({
      'Authorization': `Mbs645 ${globalAuthToken}`
    });
    
    const userid = this.stateService.getUserId();
    const folionumber = this.stateService.getAccountNumber();
    const portfolioSummaryPayload = { userid, folionumber };

    this.apiService.GetPortfolioAllocationDetail(portfolioSummaryPayload, headers).subscribe(
      (response: any) => {
        console.log('GetPortfolioSummary Response:', response);
        if (response) {
          console.log(response);
          
          setTimeout(() => {
            this.totalBalanceAmount = (response.totalBalanceAmount);
            this.portfolioAllocation = response.portfolioAllocation;
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
      allowEnterKey: false
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
