# Payment Page Documentation

## Overview
A comprehensive, secure payment page component built with Angular and PrimeNG that allows users to enter their billing information and payment details before completing a purchase.

## Features

### 1. **Billing Information Section**
- Full Name
- Email Address
- Phone Number
- Street Address
- City
- Country
- Postal Code

### 2. **Payment Method Options**
The payment page supports three payment methods:
- **Credit Card**: Visa, Mastercard, American Express
- **PayPal**: Fast and secure PayPal checkout
- **Google Pay**: One-tap payment with Google Pay

### 3. **Credit Card validation** (when Credit Card is selected)
- Card Number with Luhn algorithm validation
- Cardholder Name
- Expiry Date (MM/YY format)
- CVV (3-4 digits)

### 4. **Smart Input Formatting**
- Card Number: Automatically formatted as 4-digit groups (1234 5678 9012 3456)
- Expiry Date: Automatically formatted as MM/YY
- CVV: Restricted to numeric input only

### 5. **Security Features**
- Real-time form validation
- Payment button disabled until all required fields are valid
- CVV field masked for security
- Card numbers masked in transaction history
- SSL encryption indication
- PCI compliance badge

### 6. **Comprehensive Validation**
- Email format validation
- Phone number validation (minimum 10 digits)
- Credit card validation using Luhn algorithm
- Expiry date validation (checks for expired cards)
- CVV validation
- Card type detection (Visa, Mastercard, Amex)

## Component Structure

### Payment Component (`payment.ts`)

**Key Methods:**

```typescript
// Form Validation
isFormValid(): boolean              // Check if form is complete and valid
isValidEmail(email: string): boolean
isValidPhone(phone: string): boolean
isValidCardNumber(cardNumber: string): boolean
isValidExpiryDate(expiryDate: string): boolean
isValidCVV(cvv: string): boolean

// Input Formatting
formatCardNumber(event: any)        // Formats to: 1234 5678 9012 3456
formatExpiryDate(event: any)        // Formats to: MM/YY
formatCVV(event: any)               // Restricts to digits

// Card Detection
getCardType(): string               // Returns: Visa, Mastercard, Amex, Unknown
getCardLastFour(): string           // Returns last 4 digits

// Payment Processing
processPayment()                    // Main payment processing method
cancelPayment()                     // Navigate back to basket

// UI Helpers
showCardDetails(): boolean          // Show/hide card form
```

### Payment Service (`payment-service.ts`)

**Key Methods:**

```typescript
// Amount Management
setTotalAmount(amount: number): void
getTotalAmount(): number

// Payment Processing
processCardPayment(paymentData: PaymentData): Promise<boolean>
redirectToPayPal(paymentData: PaymentData): void
redirectToGooglePay(paymentData: PaymentData): void

// Transaction History
getTransactionHistory(): any[]
clearTransactionHistory(): void
```

## Usage

### 1. **Import and Add Route**

Already added to `app.routes.ts`:
```typescript
{path:"payment", component:Payment}
```

### 2. **Navigate to Payment Page**

From your basket or checkout component:
```typescript
import { Router } from '@angular/router';

constructor(private router: Router) {}

proceedToPayment() {
  // Set the payment amount (if using the service)
  this.paymentSrv.setTotalAmount(99.99);
  
  // Navigate to payment page
  this.router.navigate(['/payment']);
}
```

### 3. **Set Total Amount**

In the component that navigates to payment:
```typescript
import { PaymentService } from './services/payment-service';

constructor(private paymentSrv: PaymentService) {}

checkout() {
  this.paymentSrv.setTotalAmount(150.99);
  this.router.navigate(['/payment']);
}
```

## Validation Rules

### Email Validation
- Format: `user@domain.extension`
- Pattern: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Phone Number Validation
- Minimum 10 digits (excluding formatting characters)
- Accepted formats: `(555) 123-4567`, `555-123-4567`, `5551234567`, `+1 555 123 4567`

### Credit Card Validation
- Length: 13-19 digits
- Uses Luhn algorithm for validation
- Supported cards: Visa (starts with 4), Mastercard (starts with 5), AMEX (starts with 3)

### Expiry Date Validation
- Format: `MM/YY`
- Must be a valid month (01-12)
- Cannot be expired
- Checks against current date

### CVV Validation
- Length: 3 or 4 digits (4 for American Express)
- Numeric only

## Styling

### Color Scheme
- **Primary**: `#D4AF37` (Gold - Luxury theme)
- **Secondary**: `#2C2416` (Dark brown)
- **Accent**: `#1A1A1A` (Black)
- **Success**: `#10B981` (Green)
- **Error**: `#EF4444` (Red)

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly input fields
- Stacked layout on mobile devices

## Integration with Payment Providers

### Credit Card Processing
Currently mocks server-side processing. In production, integrate with:
- **Stripe**: For credit card payments
- **Square**: For card payments
- **Authorize.net**: For payment processing

### PayPal Integration
To enable PayPal:
1. Get PayPal API credentials
2. Implement OAuth2 flow
3. Update `redirectToPayPal()` method with actual PayPal API call

### Google Pay Integration
To enable Google Pay:
1. Set up Google Merchant account
2. Implement Google Pay API
3. Update `redirectToGooglePay()` method with actual Google Pay API

## Mock/Demo Mode

**Default Behavior:**
- Credit card payments are mocked and automatically succeed after 2 seconds
- PayPal and Google Pay redirects are mocked
- Transactions are stored in localStorage

**To Enable Production Mode:**
1. Implement actual payment gateway API calls
2. Replace mock delays with real API calls
3. Implement proper error handling
4. Add transaction persistence to backend

## Testing

### Run Tests
```bash
ng test
```

### Test Coverage
- Form validation tests
- Card number validation (Luhn algorithm)
- Email and phone validation
- Date validation
- Input formatting
- Card type detection
- Payment processing
- Error handling

### Test with Stripe Test Cards
```
Visa:       4532015112830366
Mastercard: 5425233010103442
Amex:       378282246310005
```

## Security Considerations

⚠️ **Important**: The current implementation is for demo purposes only.

### Production Security Requirements:
1. **Never send card details to your backend**
   - Use Stripe.js, PayPal SDK, or Google Pay
   - Let the payment provider handle sensitive data

2. **PCI Compliance**
   - Use payment provider's hosted fields
   - Never store complete card numbers
   - Implement SSL/TLS encryption

3. **Data Protection**
   - Use HTTPS only
   - Implement CSRF protection
   - Validate all inputs server-side

4. **Best Practices**
   - Use tokenization for card data
   - Implement rate limiting
   - Log payment attempts
   - Monitor for fraud patterns

## Error Handling

The component provides user-friendly error messages:

| Error | Message |
|-------|---------|
| Invalid email | "Please enter a valid email address" |
| Invalid phone | "Please enter a valid phone number" |
| Invalid card | "Invalid card number" |
| Expired card | "Invalid or expired date" |
| Invalid CVV | "3-4 digits required" |
| Missing fields | "Please fill in all required fields" |

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimization

- Lazy loading of payment form
- Minimal re-renders with OnPush change detection (can be added)
- Efficient validation algorithms
- CSS animations are hardware-accelerated

## Accessibility

- ARIA labels on all form fields
- Keyboard navigation support
- Screen reader compatible
- High contrast text
- Focus indicators on form inputs

## Future Enhancements

1. **Save Payment Methods**: Allow users to save cards
2. **Multi-currency Support**: Support different currencies
3. **Installments**: Offer payment plans
4. **Apple Pay**: Add Apple Pay option
5. **Address Verification**: Integrate address validation API
6. **Invoice Generation**: Auto-generate and email invoices
7. **Receipt Page**: Show detailed receipt after payment

## Troubleshooting

### Form Validation Not Working
- Check that all required fields are filled
- Verify email format is correct
- Ensure card number is 13-19 digits

### Payment Button Disabled
- Complete all required billing information
- For card payment: Fill all card details
- Check console for validation errors

### Payment Not Processing
- Check browser console for errors
- Verify test card numbers (use provided test cards)
- Check network tab for API responses

## Support

For issues or questions:
1. Check browser console for error messages
2. Review validation error indicators
3. Verify all fields are complete
4. Check network requests in DevTools

---

## Code Examples

### Complete Payment Flow Example

```typescript
// In your basket/checkout component
import { Router } from '@angular/router';
import { PaymentService } from './services/payment-service';

export class BasketComponent {
  constructor(
    private paymentSrv: PaymentService,
    private router: Router
  ) {}

  checkout() {
    const totalPrice = this.calculateTotal();
    
    // Set the amount to be paid
    this.paymentSrv.setTotalAmount(totalPrice);
    
    // Navigate to payment page
    this.router.navigate(['/payment']);
  }

  private calculateTotal(): number {
    // Your logic to calculate total
    return 99.99;
  }
}
```

### Retrieve Transaction History

```typescript
import { PaymentService } from './services/payment-service';

export class AdminComponent {
  transactions: any[] = [];

  constructor(private paymentSrv: PaymentService) {}

  getPaymentHistory() {
    this.transactions = this.paymentSrv.getTransactionHistory();
    console.log('Payment transactions:', this.transactions);
  }
}
```

---

**Last Updated**: February 2026
**Version**: 1.0.0
