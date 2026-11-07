import { Injectable } from '@angular/core';

export interface PaymentData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  paymentMethod: 'card' | 'paypal' | 'googlepay';
  amount: number;
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  cvv?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private totalAmount: number = 0;

  constructor() {}

  /**
   * Set the total amount for the payment
   */
  setTotalAmount(amount: number): void {
    this.totalAmount = amount;
  }

  /**
   * Get the total amount for the payment
   */
  getTotalAmount(): number {
    // In a real scenario, you would fetch this from the basket/ticket service
    // For now, returning a demo amount
    return this.totalAmount || 99.99;
  }

  /**
   * Process credit card payment
   * In a real scenario, this would call your backend API
   */
  async processCardPayment(paymentData: PaymentData): Promise<boolean> {
    return new Promise((resolve) => {
      // Simulate API call delay
      setTimeout(() => {
        try {
          // In production, you would send this to your backend
          // which would handle the payment using Stripe, Square, or similar
          console.log('Processing card payment:', {
            ...paymentData,
            cardNumber: this.maskCardNumber(paymentData.cardNumber || '')
          });

          // Mock validation - in real scenario, backend would handle this
          if (this.validatePaymentData(paymentData)) {
            // Store transaction in localStorage for demo purposes
            this.storeTransaction(paymentData);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          console.error('Payment processing error:', error);
          resolve(false);
        }
      }, 2000);
    });
  }

  /**
   * Redirect to PayPal checkout
   */
  redirectToPayPal(paymentData: PaymentData): void {
    try {
      // In production, you would integrate with PayPal's API
      // This is a simplified example
      const paypalUrl = `https://www.paypal.com/checkout?amount=${paymentData.amount}&email=${paymentData.email}`;
      
      // Store pending transaction
      sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
      
      // Redirect would happen here
      console.log('Redirecting to PayPal:', paypalUrl);
      // window.location.href = paypalUrl;
      
      // For demo purposes, we'll mock success
      setTimeout(() => {
        this.handlePaymentSuccess(paymentData);
      }, 1000);
    } catch (error) {
      console.error('PayPal redirect error:', error);
    }
  }

  /**
   * Redirect to Google Pay checkout
   */
  redirectToGooglePay(paymentData: PaymentData): void {
    try {
      // In production, you would use the Google Pay API
      // This is a simplified example
      const googlePayRequest = {
        apiVersion: 2,
        apiVersionMinor: 0,
        allowedPaymentMethods: [
          {
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA'],
            },
          }
        ],
        merchantInfo: {
          merchantId: '12345678901234567890',
          merchantName: 'Your Company Name',
        },
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: paymentData.amount.toString(),
          currencyCode: 'USD',
        },
      };

      // Store pending transaction
      sessionStorage.setItem('pendingPayment', JSON.stringify(paymentData));
      
      console.log('Initiating Google Pay:', googlePayRequest);
      
      // For demo purposes, we'll mock success
      setTimeout(() => {
        this.handlePaymentSuccess(paymentData);
      }, 1000);
    } catch (error) {
      console.error('Google Pay error:', error);
    }
  }

  /**
   * Validate payment data
   */
  private validatePaymentData(paymentData: PaymentData): boolean {
    // Check required fields
    if (!paymentData.fullName || !paymentData.email || !paymentData.phone ||
        !paymentData.address || !paymentData.city || !paymentData.country ||
        !paymentData.postalCode || !paymentData.amount) {
      return false;
    }

    // Check card specific fields if card payment
    if (paymentData.paymentMethod === 'card') {
      if (!paymentData.cardNumber || !paymentData.cardholderName ||
          !paymentData.expiryDate || !paymentData.cvv) {
        return false;
      }
    }

    return true;
  }

  /**
   * Store transaction in localStorage (for demo/persistence)
   */
  private storeTransaction(paymentData: PaymentData): void {
    const transaction = {
      id: this.generateTransactionId(),
      ...paymentData,
      cardNumber: paymentData.cardNumber ? this.maskCardNumber(paymentData.cardNumber) : undefined,
      cvv: undefined, // Never store CVV
      timestamp: new Date().toISOString(),
    };

    const existingTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    existingTransactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(existingTransactions));
  }

  /**
   * Handle successful payment
   */
  private handlePaymentSuccess(paymentData: PaymentData): void {
    this.storeTransaction(paymentData);
    console.log('Payment successful:', {
      transactionId: this.generateTransactionId(),
      amount: paymentData.amount,
      method: paymentData.paymentMethod,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Mask credit card number for display (show only last 4 digits)
   */
  private maskCardNumber(cardNumber: string): string {
    const sanitized = cardNumber.replace(/\s/g, '');
    if (sanitized.length < 4) return cardNumber;
    return `****-****-****-${sanitized.slice(-4)}`;
  }

  /**
   * Get transaction history
   */
  getTransactionHistory(): any[] {
    return JSON.parse(localStorage.getItem('transactions') || '[]');
  }

  /**
   * Clear transaction history (for testing)
   */
  clearTransactionHistory(): void {
    localStorage.removeItem('transactions');
  }
}
