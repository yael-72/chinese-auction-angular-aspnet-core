import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Ticket } from '../model/ticket.model';

export interface PaymentCheckoutData {
  tickets: Ticket[];
  totalAmount: number;
  userId: number;
  userName?: string;
  userEmail?: string;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  transactionId?: string;
  paidTickets?: Ticket[];
  failedTickets?: Ticket[];
}

@Injectable({
  providedIn: 'root'
})
export class PaymentStateService {
  
  private checkoutDataSubject = new BehaviorSubject<PaymentCheckoutData | null>(null);
  private paymentResultSubject = new BehaviorSubject<PaymentResult | null>(null);
  
  public checkoutData$ = this.checkoutDataSubject.asObservable();
  public paymentResult$ = this.paymentResultSubject.asObservable();

  constructor() {}

  /**
   * Set checkout data before navigating to payment
   */
  setCheckoutData(data: PaymentCheckoutData): void {
    this.checkoutDataSubject.next(data);
  }

  /**
   * Get current checkout data
   */
  getCheckoutData(): PaymentCheckoutData | null {
    return this.checkoutDataSubject.value;
  }

  /**
   * Emit payment result after successful payment
   */
  setPaymentResult(result: PaymentResult): void {
    this.paymentResultSubject.next(result);
  }

  /**
   * Get current payment result
   */
  getPaymentResult(): PaymentResult | null {
    return this.paymentResultSubject.value;
  }

  /**
   * Clear checkout data (after payment)
   */
  clearCheckoutData(): void {
    this.checkoutDataSubject.next(null);
  }

  /**
   * Clear payment result
   */
  clearPaymentResult(): void {
    this.paymentResultSubject.next(null);
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.checkoutDataSubject.next(null);
    this.paymentResultSubject.next(null);
  }
}
