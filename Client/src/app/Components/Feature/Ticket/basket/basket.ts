import { Component, inject } from '@angular/core';
import { TicketService } from '../../../../services/ticket-service';
import { Ticket } from '../../../../model/ticket.model';
import { User } from '../../../../model/user.model';
import { Authservice } from '../../../../services/authservice';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber'
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { CardModule } from 'primeng/card';
import { PaymentStateService, PaymentCheckoutData, PaymentResult } from '../../../../services/payment-state-service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-basket',
  imports: [ButtonModule,DataViewModule,TagModule,CommonModule,ConfirmPopupModule,CardModule, InputNumberModule,FormsModule,CheckboxModule,ToastModule],
  providers:[MessageService,ConfirmationService],
  templateUrl: './basket.html',
  styleUrl: './basket.scss',
})
export class Basket {
  ticketSrv: TicketService = inject(TicketService)
  authSrv: Authservice = inject(Authservice)
  paymentStateSrv: PaymentStateService = inject(PaymentStateService)
  router: Router = inject(Router)
  msgSrv=inject(MessageService)
  confirmSrv=inject(ConfirmationService)

  private destroy$ = new Subject<void>();

  list$: Ticket[] = []
  //  loggedIn: boolean = false
  user: any
  current:Ticket[]=[]
  allSelected: boolean = false
  total: number = 0;

  paid:Ticket[] =[]
  groupedPaidTickets: Map<string, Ticket[]> = new Map();

  calculateTotal() {
    this.total = this.current.reduce((sum, ticket) => sum + (ticket.amount * ticket.gift.price), 0);
  }

  groupTicketsByDateTime() {
    this.groupedPaidTickets.clear();
    
    // Sort paid tickets by date and time in descending order (newest first)
    const sortedTickets = [...this.paid].sort((a, b) => {
      const dateA = a.paidDate ? new Date(a.paidDate).getTime() : 0;
      const dateB = b.paidDate ? new Date(b.paidDate).getTime() : 0;
      return dateB - dateA;
    });

    // Group tickets by date and time
    sortedTickets.forEach(ticket => {
      const dateTimeStr = ticket.paidDate 
        ? new Date(ticket.paidDate).toLocaleString('he-IL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        : 'תאריך לא ידוע';
      
      if (!this.groupedPaidTickets.has(dateTimeStr)) {
        this.groupedPaidTickets.set(dateTimeStr, []);
      }
      this.groupedPaidTickets.get(dateTimeStr)!.push(ticket);
    });
  }

  getSortedDateTimeKeys(): string[] {
    return Array.from(this.groupedPaidTickets.keys());
  }
 

  ngOnInit() {
     this.authSrv.user.subscribe(u => {
      this.user = u
      if (this.user && this.user.id) {
        this.loadTickets()
        this.loadPaidTickets()
        this.listenForPaymentResults()
      }
    })
  }

  /**
   * Listen for payment results from payment component
   */
  private listenForPaymentResults() {
    this.paymentStateSrv.paymentResult$
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result && result.success) {
          this.msgSrv.add({
            severity: 'success',
            summary: 'Payment Complete',
            detail: result.message,
            life: 3000
          });
          // Reload tickets to show updated status
          setTimeout(() => {
            this.loadTickets();
            this.loadPaidTickets();
            this.paymentStateSrv.clearPaymentResult();
          }, 500);
        }
      });
  }

   loadTickets(){
    if (!this.user || !this.user.id) {
      console.log('loadTickets: no user available');
      return;
    }
    console.log('loadTickets: loading for user id=', this.user.id);
    this.ticketSrv.getDraft(this.user.id).subscribe({
      next: data => {
        this.list$ = data;
        console.log('loadTickets: received', data?.length, 'tickets');
      },
      error: err => console.error('loadTickets error', err)
    })
     
  }
  loadPaidTickets(){
    if (!this.user || !this.user.id) {
      console.log('loadPaidTickets: no user available');
      return;
    }
    this.ticketSrv.getPaidForUser(this.user.id).subscribe({
      next: data => {
        this.paid = data || [];
        this.groupTicketsByDateTime();
        console.log( data);
      },
      error: err => console.error('loadPaidTickets error', err)
    })
     
  }

  delete(event:Event,id:number){
    this.confirmSrv.confirm({
            target: event.currentTarget as EventTarget,
            message: 'למחוק?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel:"כן",
            rejectLabel:"לא",
            acceptButtonStyleClass:"p-button-danger",
            rejectButtonStyleClass:"p-button-secondary",
            accept: () => {
              this.ticketSrv.delete(id).subscribe({
                next: (res: any) => {
                  this.loadTickets();
                  const detail = res?.message ?? 'נמחק';
                  this.msgSrv.add({ severity: 'success', detail, life: 1200 });
                },
                error: (err: any) => {
                  const detail = err?.error?.message ?? 'Could not delete ticket';
                  this.msgSrv.add({ severity: 'error', detail, life: 3000 });
                }
              })
            }
        });
    }
            
  changeAmount(id:number,amount:number){
    this.ticketSrv.changeAmount(id,amount).subscribe({
      next: (res: any) => {
        this.loadTickets();
        const detail = res?.message ?? 'Amount updated';
        this.msgSrv.add({ severity: 'success', detail, life: 1200 });
      },
      error: (err: any) => {
        const detail = err?.error?.message ?? 'Could not update amount';
        this.msgSrv.add({ severity: 'error', detail, life: 3000 });
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Proceed to payment page with selected tickets
   */
  proceedToPayment() {
    // Validate that tickets are selected
    if (this.current.length === 0) {
      this.msgSrv.add({
        severity: 'warn',
        summary: 'No Items Selected',
        detail: 'Please select items to pay for',
        life: 3000
      });
      return;
    }

    // Validate that user is logged in
    if (!this.user || !this.user.id) {
      this.msgSrv.add({
        severity: 'error',
        summary: 'Authentication Required',
        detail: 'Please log in to proceed to payment',
        life: 3000
      });
      return;
    }

    // Prepare checkout data
    const checkoutData: PaymentCheckoutData = {
      tickets: this.current,
      totalAmount: this.total,
      userId: this.user.id,
      userName: this.user.name || this.user.userName,
      userEmail: this.user.email
    };

    // Store checkout data in payment state service
    this.paymentStateSrv.setCheckoutData(checkoutData);

    console.log('Proceeding to payment with data:', checkoutData);

    // Navigate to payment page
    this.router.navigate(['/payment']);
  }

// פונקציה לבחירת/הסרת כל הפריטים
toggleAll() {
    if (this.allSelected) {
        this.current = [...this.list$]; 
        
    } else {
        this.current = [];
    }
    this.calculateTotal();
}

onItemChange(items: Ticket[]) {
    this.allSelected = this.current.length === items.length;
    this.calculateTotal();
}
}
