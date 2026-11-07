// Integration Guide: Connecting Basket to Payment Page

/*
STEP 1: Add Payment Service Import to Basket Component
=========================================================
*/

// basket.ts - Add these imports at the top:
import { PaymentService } from '../../../../services/payment-service';
import { Router } from '@angular/router';

/*
STEP 2: Inject Dependencies
============================
*/

// In the Basket component class, add to your injections:
paymentSrv = inject(PaymentService);
router = inject(Router);

/*
STEP 3: Add Method to Navigate to Payment
===========================================
*/

// Add this method to your Basket component:

proceedToPayment() {
  // Calculate the total amount from your tickets/items
  const totalAmount = this.calculateTotalAmount();
  
  // Set the amount in the payment service
  this.paymentSrv.setTotalAmount(totalAmount);
  
  // Navigate to payment page
  this.router.navigate(['/payment']);
}

// Helper method to calculate total
private calculateTotalAmount(): number {
  if (this.tickets && this.tickets.length > 0) {
    return this.tickets.reduce((sum, ticket) => {
      return sum + (ticket.price * ticket.quantity);
    }, 0);
  }
  return 0;
}

/*
STEP 4: Add Payment Button to Basket HTML
===========================================
*/

// In basket.html, add a button that looks like this:

/*
<p-button 
  label="Proceed to Payment"
  icon="pi pi-credit-card"
  severity="success"
  (click)="proceedToPayment()"
  [disabled]="!tickets || tickets.length === 0"
></p-button>
*/

/*
STEP 5: (Optional) Import PaymentModule for Google Pay/PayPal Icons
=================================================================
*/

// In payment.ts imports, add:
// Icons are already available via PrimeIcons

/*
EXAMPLE: Complete Basket Integration
=====================================
*/

// Here's how your updated basket method might look:

public proceedToPayment() {
  // Validate that basket has items
  if (!this.tickets || this.tickets.length === 0) {
    this.msgSrv.add({
      severity: 'warn',
      summary: 'Empty Basket',
      detail: 'Please add items to your basket before proceeding',
      life: 3000
    });
    return;
  }

  // Calculate total
  const totalAmount = this.tickets.reduce((sum, ticket) => {
    return sum + (ticket.price * (ticket.quantity || 1));
  }, 0);

  // Verify amount
  if (totalAmount <= 0) {
    this.msgSrv.add({
      severity: 'error',
      summary: 'Invalid Amount',
      detail: 'Unable to calculate total. Please try again.',
      life: 3000
    });
    return;
  }

  // Set payment amount
  this.paymentSrv.setTotalAmount(totalAmount);

  // Navigate to payment
  this.router.navigate(['/payment']);
}

/*
EXAMPLE HTML: Add to Basket Component
======================================
*/

/*
<!-- Add to basket.html where you want the payment button -->
<div class="basket-actions">
  <p-button 
    label="Continue Shopping"
    icon="pi pi-shopping-cart"
    severity="secondary"
    (click)="continueShopping()"
  ></p-button>
  
  <p-button 
    label="Proceed to Payment"
    icon="pi pi-credit-card"
    severity="success"
    (click)="proceedToPayment()"
    [disabled]="!tickets || tickets.length === 0"
  ></p-button>
</div>
*/

/*
EXAMPLE STYLING: CSS for Basket Actions
=========================================
*/

/*
.basket-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    
    button {
      width: 100%;
    }
  }
}
*/

/*
ROUTING INFORMATION
====================
Payment Page Route: /payment
Basket Route: /basket

Navigation Flow:
Basket (/basket) → Payment (/payment) → Success/Confirmation
*/

/*
DATA FLOW
=========
1. User views basket with items
2. User clicks "Proceed to Payment" button
3. Component calculates total amount
4. Service stores amount (paymentSrv.setTotalAmount)
5. Router navigates to /payment
6. Payment component loads and displays the amount
7. User enters billing & payment details
8. Payment is processed
9. User is redirected back to basket or confirmation page
*/

/*
IMPORTANT NOTES
===============
1. The payment amount is stored in the PaymentService
2. The Payment component reads it on initialization
3. If amount is 0, it will show the demo amount (99.99)
4. All validation is done before allowing payment

To retrieve transaction history after payment:
  transactions = this.paymentSrv.getTransactionHistory();
*/

export class BasketIntegration {
  // This is a guide class - use the code snippets above in your actual components
}
