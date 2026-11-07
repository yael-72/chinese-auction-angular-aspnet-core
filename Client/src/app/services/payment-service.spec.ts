import { TestBed } from '@angular/core/testing';
import { PaymentService } from './payment-service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentService);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Total Amount Management', () => {
    it('should set and get total amount', () => {
      service.setTotalAmount(150.00);
      expect(service.getTotalAmount()).toBe(150.00);
    });

    it('should return default amount if not set', () => {
      const amount = service.getTotalAmount();
      expect(amount).toBeGreaterThan(0);
    });
  });

  describe('Card Payment Processing', () => {
    it('should process valid card payment', async () => {
      const paymentData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '5551234567',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
        paymentMethod: 'card' as const,
        amount: 99.99,
        cardNumber: '4532015112830366',
        cardholderName: 'John Doe',
        expiryDate: '12/25',
        cvv: '123'
      };

      const result = await service.processCardPayment(paymentData);
      expect(result).toBe(true);
    });

    it('should reject card payment with missing data', async () => {
      const incompletePaymentData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '5551234567',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
        paymentMethod: 'card' as const,
        amount: 99.99,
        cardNumber: undefined,
        cardholderName: undefined,
        expiryDate: undefined,
        cvv: undefined
      };

      const result = await service.processCardPayment(incompletePaymentData);
      expect(result).toBe(false);
    });

    it('should store transaction after successful payment', async () => {
      const paymentData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '5551234567',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
        paymentMethod: 'card' as const,
        amount: 99.99,
        cardNumber: '4532015112830366',
        cardholderName: 'John Doe',
        expiryDate: '12/25',
        cvv: '123'
      };

      await service.processCardPayment(paymentData);
      const transactions = service.getTransactionHistory();
      
      expect(transactions.length).toBeGreaterThan(0);
      expect(transactions[0].email).toBe('john@example.com');
    });
  });

  describe('PayPal Redirection', () => {
    it('should redirect to PayPal', () => {
      const paymentData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '5551234567',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
        paymentMethod: 'paypal' as const,
        amount: 99.99
      };

      spyOn(console, 'log');
      service.redirectToPayPal(paymentData);
      
      expect(console.log).toHaveBeenCalled();
      const pendingPayment = sessionStorage.getItem('pendingPayment');
      expect(pendingPayment).toBeTruthy();
    });
  });

  describe('Google Pay Redirection', () => {
    it('should redirect to Google Pay', () => {
      const paymentData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '5551234567',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
        paymentMethod: 'googlepay' as const,
        amount: 99.99
      };

      spyOn(console, 'log');
      service.redirectToGooglePay(paymentData);
      
      expect(console.log).toHaveBeenCalled();
      const pendingPayment = sessionStorage.getItem('pendingPayment');
      expect(pendingPayment).toBeTruthy();
    });
  });

  describe('Transaction History', () => {
    it('should retrieve transaction history', async () => {
      const paymentData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '5551234567',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
        paymentMethod: 'card' as const,
        amount: 99.99,
        cardNumber: '4532015112830366',
        cardholderName: 'John Doe',
        expiryDate: '12/25',
        cvv: '123'
      };

      await service.processCardPayment(paymentData);
      const history = service.getTransactionHistory();
      
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].amount).toBe(99.99);
    });

    it('should clear transaction history', async () => {
      const paymentData = {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '5551234567',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        postalCode: '10001',
        paymentMethod: 'card' as const,
        amount: 99.99,
        cardNumber: '4532015112830366',
        cardholderName: 'John Doe',
        expiryDate: '12/25',
        cvv: '123'
      };

      await service.processCardPayment(paymentData);
      service.clearTransactionHistory();
      
      const history = service.getTransactionHistory();
      expect(history.length).toBe(0);
    });
  });
});
