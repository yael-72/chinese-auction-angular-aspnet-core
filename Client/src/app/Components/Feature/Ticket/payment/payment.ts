import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { Authservice } from '../../../../services/authservice';
import { User } from '../../../../model/user.model';
import { PaymentStateService, PaymentCheckoutData, PaymentResult } from '../../../../services/payment-state-service';
import { TicketService } from '../../../../services/ticket-service';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    CardModule,
    ToastModule,
    DividerModule
  ],
  providers: [MessageService],
  templateUrl: './payment.html',
  styleUrl: './payment.scss',
})
export class Payment implements OnInit, OnDestroy {
  authSrv = inject(Authservice);
  paymentStateSrv = inject(PaymentStateService);
  ticketSrv = inject(TicketService);
  msgSrv = inject(MessageService);
  router = inject(Router);

  private destroy$ = new Subject<void>();
  
  currentUser: User | null = null;
  checkoutData: PaymentCheckoutData | null = null;
  
  // Form fields
  fullName: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';
  city: string = '';
  country: string = '';
  postalCode: string = '';
  
  // Credit Card fields
  cardNumber: string = '';
  cardholderName: string = '';
  expiryDate: string = '';
  cvv: string = '';
  
  // Payment method
  selectedPaymentMethod: 'card' | 'paypal' | 'googlepay' = 'card';
  
  // Processing state
  isProcessing: boolean = false;
  
  // Amount (from basket/checkout data)
  totalAmount: number = 0;
  selectedTickets: any[] = [];

  ngOnInit() {
    // Get current user from auth service
    const user = this.authSrv.user.value;
    if (user) {
      this.currentUser = user;
      this.fullName = user.name || '';
      this.email = user.email || '';
      this.phone = user.phone || '';
    }
    
    // Get checkout data from payment state service
    // First try to get current value
    let checkoutData = this.paymentStateSrv.getCheckoutData();
    
    console.log('Payment page initialized');
    console.log('Checkout data received (current value):', checkoutData);
    
    if (checkoutData) {
      this.handleCheckoutData(checkoutData);
    } else {
      // If not available yet, subscribe to observable
      console.warn('⚠ No checkout data available immediately, subscribing to observable...');
      this.paymentStateSrv.checkoutData$
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
          if (data) {
            console.log('✓ Checkout data received from observable:', data);
            this.handleCheckoutData(data);
          }
        });
    }
  }

  /**
   * Handle checkout data assignment
   */
  private handleCheckoutData(checkoutData: PaymentCheckoutData) {
    this.checkoutData = checkoutData;
    this.totalAmount = checkoutData.totalAmount;
    this.selectedTickets = checkoutData.tickets || [];
    
    console.log('✓ Payment initialized with checkout data:', {
      totalAmount: this.totalAmount,
      ticketCount: this.selectedTickets?.length,
      tickets: this.selectedTickets
    });
    
    if (!this.selectedTickets || this.selectedTickets.length === 0) {
      console.warn('⚠ WARNING: selectedTickets is empty!');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Validates if all required fields are filled
   */
  isFormValid(): boolean {
    // Personal details validation
    if (!this.fullName || !this.email || !this.phone || !this.address || 
        !this.city || !this.country || !this.postalCode) {
      return false;
    }

    // Email validation
    if (!this.isValidEmail(this.email)) {
      return false;
    }

    // Phone validation (basic)
    if (!this.isValidPhone(this.phone)) {
      return false;
    }

    // Credit card validation (only for card payment)
    if (this.selectedPaymentMethod === 'card') {
      if (!this.isValidCardNumber(this.cardNumber)) {
        return false;
      }
      if (!this.cardholderName.trim()) {
        return false;
      }
      if (!this.isValidExpiryDate(this.expiryDate)) {
        return false;
      }
      if (!this.isValidCVV(this.cvv)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validates email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates phone number (basic)
   */
  isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    const digitsOnly = phone.replace(/\D/g, '');
    return phoneRegex.test(phone) && digitsOnly.length >= 10;
  }

  /**
   * Validates credit card number using Luhn algorithm
   */
  isValidCardNumber(cardNumber: string): boolean {
    const sanitized = cardNumber.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(sanitized)) {
      return false;
    }

    // Luhn algorithm
    let sum = 0;
    let isEven = false;

    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Validates expiry date format (MM/YY)
   */
  isValidExpiryDate(expiryDate: string): boolean {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    
    if (!regex.test(expiryDate)) {
      return false;
    }

    const [month, year] = expiryDate.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expYear = parseInt(year, 10);
    const expMonth = parseInt(month, 10);

    if (expYear < currentYear) {
      return false;
    }

    if (expYear === currentYear && expMonth < currentMonth) {
      return false;
    }

    return true;
  }

  /**
   * Validates CVV (3-4 digits)
   */
  isValidCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  /**
   * Formats card number as user types (adds spaces every 4 digits)
   */
  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    
    this.cardNumber = formattedValue;
  }

  /**
   * Formats expiry date as user types (MM/YY)
   */
  formatExpiryDate(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    
    this.expiryDate = value;
  }

  /**
   * Allows only digits in CVV
   */
  formatCVV(event: any) {
    this.cvv = event.target.value.replace(/\D/g, '').slice(0, 4);
  }

  /**
   * Get card type based on card number
   */
  getCardType(): string {
    const cardNumber = this.cardNumber.replace(/\s/g, '');
    
    if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(cardNumber)) {
      return 'Visa';
    } else if (/^5[1-5][0-9]{14}$/.test(cardNumber)) {
      return 'Mastercard';
    } else if (/^3[47][0-9]{13}$/.test(cardNumber)) {
      return 'American Express';
    }
    
    return 'Unknown';
  }

  /**
   * Process payment based on selected method
   */
  async processPayment() {
    // Validate form before processing
    if (!this.isFormValid()) {
      this.msgSrv.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields correctly.',
        life: 3000
      });
      return;
    }

    // Check if tickets are available
    console.log('Processing payment - selectedTickets:', this.selectedTickets);
    console.log('Processing payment - selectedTickets length:', this.selectedTickets?.length);
    
    if (!this.selectedTickets || this.selectedTickets.length === 0) {
      this.msgSrv.add({
        severity: 'error',
        summary: 'No Items Selected',
        detail: 'No items selected for payment. Please go back to basket and select items.',
        life: 4000
      });
      console.error('❌ Payment cannot proceed: No tickets selected', {
        selectedTickets: this.selectedTickets,
        checkoutData: this.checkoutData
      });
      return;
    }

    this.isProcessing = true;

    try {
      console.log('Processing payment with tickets:', this.selectedTickets);

      // Update database - mark all selected tickets as paid
      await this.processTicketPayments();

      // Emit payment result for basket to listen
      const paymentResult: PaymentResult = {
        success: true,
        message: 'Payment completed successfully!',
        transactionId: this.generateTransactionId(),
        paidTickets: this.selectedTickets
      };
      
      this.paymentStateSrv.setPaymentResult(paymentResult);

      // Show success message
      this.msgSrv.add({
        severity: 'success',
        summary: 'Payment Successful!',
        detail: `Your payment has been completed. ${this.selectedTickets.length} ticket(s) marked as paid.`,
        life: 4000
      });

      console.log('Payment successful, redirecting to basket...');
      
      // Redirect back to basket after 2 seconds
      setTimeout(() => {
        this.paymentStateSrv.clearCheckoutData();
        this.router.navigate(['/basket']);
      }, 2000);
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      console.error('Error message:', error?.message);
      console.error('Error status:', error?.status);
      console.error('Error details:', error?.error);
      
      let errorDetail = 'An error occurred while processing your payment. Please try again.';
      if (error?.status === 401) {
        errorDetail = 'Not authorized. Please login again.';
      } else if (error?.status === 404) {
        errorDetail = 'Ticket not found. Please check your selection.';
      } else if (error?.status === 500) {
        errorDetail = 'Server error. Please try again later.';
      } else if (error?.message) {
        errorDetail = error.message;
      }
      
      this.msgSrv.add({
        severity: 'error',
        summary: 'Payment Error',
        detail: errorDetail,
        life: 4000
      });
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process individual ticket payments - Call server to mark tickets as paid
   */
  private async processTicketPayments(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🔄 Starting ticket payment process for', this.selectedTickets.length, 'tickets');
      
      if (!this.selectedTickets || this.selectedTickets.length === 0) {
        console.error('❌ No tickets to process');
        reject(new Error('No tickets to process'));
        return;
      }

      // Create array of payment calls for each ticket
      const paymentCalls = this.selectedTickets.map(ticket => {
        console.log(`📤 Preparing to call pay() for ticket ID: ${ticket.id}`);
        return this.ticketSrv.pay(ticket.id);
      });

      // Execute all payment calls in parallel using forkJoin
      forkJoin(paymentCalls).subscribe({
        next: (results: any[]) => {
          console.log('✅ All tickets marked as paid successfully!');
          results.forEach((result, index) => {
            console.log(`✓ Ticket ${index + 1}: ID ${this.selectedTickets[index].id} - Response:`, result);
          });
          resolve();
        },
        error: (error: any) => {
          console.error('❌ Error marking tickets as paid:', error);
          console.error('Error status:', error?.status);
          console.error('Error message:', error?.message);
          console.error('Error body:', error?.error);
          reject(error);
        }
      });
    });
  }

  /**
   * Generate transaction ID
   */
  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cancel payment and go back
   */
  cancelPayment() {
    this.router.navigate(['/basket']);
  }

  /**
   * Check if credit card section should be shown
   */
  showCardDetails(): boolean {
    return this.selectedPaymentMethod === 'card';
  }

  /**
   * Get last 4 digits of card
   */
  getCardLastFour(): string {
    const sanitized = this.cardNumber.replace(/\s/g, '');
    return sanitized.slice(-4);
  }
}
