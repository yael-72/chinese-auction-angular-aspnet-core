import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Payment } from './payment';
import { Authservice } from '../../../../services/authservice';
import { PaymentService } from '../../../../services/payment-service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

describe('Payment Component', () => {
  let component: Payment;
  let fixture: ComponentFixture<Payment>;
  let mockAuthService: jasmine.SpyObj<Authservice>;
  let mockPaymentService: jasmine.SpyObj<PaymentService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Create mock services
    mockAuthService = jasmine.createSpyObj('Authservice', [], {
      user: { value: null }
    });
    mockPaymentService = jasmine.createSpyObj('PaymentService', [
      'getTotalAmount',
      'processCardPayment',
      'redirectToPayPal',
      'redirectToGooglePay'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [Payment],
      providers: [
        { provide: Authservice, useValue: mockAuthService },
        { provide: PaymentService, useValue: mockPaymentService },
        { provide: Router, useValue: mockRouter },
        MessageService
      ]
    }).compileComponents();

    // Setup default mock values
    mockPaymentService.getTotalAmount.and.returnValue(99.99);

    fixture = TestBed.createComponent(Payment);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Email Validation', () => {
    it('should validate correct email format', () => {
      expect(component.isValidEmail('test@example.com')).toBe(true);
      expect(component.isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email format', () => {
      expect(component.isValidEmail('invalid-email')).toBe(false);
      expect(component.isValidEmail('@example.com')).toBe(false);
      expect(component.isValidEmail('test@')).toBe(false);
      expect(component.isValidEmail('')).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('should validate correct phone numbers', () => {
      expect(component.isValidPhone('+1 (555) 123-4567')).toBe(true);
      expect(component.isValidPhone('555-123-4567')).toBe(true);
      expect(component.isValidPhone('5551234567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(component.isValidPhone('123')).toBe(false);
      expect(component.isValidPhone('abc def ghij')).toBe(false);
      expect(component.isValidPhone('')).toBe(false);
    });
  });

  describe('Credit Card Validation', () => {
    it('should validate correct card number (Visa)', () => {
      // Valid Visa test number
      expect(component.isValidCardNumber('4532015112830366')).toBe(true);
    });

    it('should validate correct card number (Mastercard)', () => {
      // Valid Mastercard test number
      expect(component.isValidCardNumber('5425233010103442')).toBe(true);
    });

    it('should reject invalid card numbers', () => {
      expect(component.isValidCardNumber('1234567890123456')).toBe(false);
      expect(component.isValidCardNumber('123')).toBe(false);
      expect(component.isValidCardNumber('')).toBe(false);
    });

    it('should handle spaces in card number', () => {
      expect(component.isValidCardNumber('4532 0151 1283 0366')).toBe(true);
    });
  });

  describe('Expiry Date Validation', () => {
    it('should validate future expiry dates', () => {
      const futureMonth = new Date().getMonth() + 2;
      const futureYear = (new Date().getFullYear() + 1) % 100;
      const expiryDate = `${String(futureMonth).padStart(2, '0')}/${String(futureYear).padStart(2, '0')}`;
      expect(component.isValidExpiryDate(expiryDate)).toBe(true);
    });

    it('should reject expired dates', () => {
      expect(component.isValidExpiryDate('01/20')).toBe(false);
    });

    it('should reject invalid format', () => {
      expect(component.isValidExpiryDate('13/25')).toBe(false);
      expect(component.isValidExpiryDate('1/25')).toBe(false);
      expect(component.isValidExpiryDate('01-25')).toBe(false);
    });
  });

  describe('CVV Validation', () => {
    it('should validate 3-digit CVV', () => {
      expect(component.isValidCVV('123')).toBe(true);
    });

    it('should validate 4-digit CVV', () => {
      expect(component.isValidCVV('1234')).toBe(true);
    });

    it('should reject invalid CVV', () => {
      expect(component.isValidCVV('12')).toBe(false);
      expect(component.isValidCVV('12345')).toBe(false);
      expect(component.isValidCVV('abc')).toBe(false);
    });
  });

  describe('Form Validation', () => {
    it('should return false when required fields are empty', () => {
      component.fullName = '';
      component.email = '';
      expect(component.isFormValid()).toBe(false);
    });

    it('should return false with invalid email for card payment', () => {
      component.fullName = 'John Doe';
      component.email = 'invalid-email';
      component.phone = '5551234567';
      component.address = '123 Main St';
      component.city = 'New York';
      component.country = 'USA';
      component.postalCode = '10001';
      component.selectedPaymentMethod = 'card';
      component.cardNumber = '4532015112830366';
      component.cardholderName = 'John Doe';
      component.expiryDate = '12/25';
      component.cvv = '123';
      expect(component.isFormValid()).toBe(false);
    });

    it('should return true when all required fields are valid', () => {
      component.fullName = 'John Doe';
      component.email = 'john@example.com';
      component.phone = '5551234567';
      component.address = '123 Main St';
      component.city = 'New York';
      component.country = 'USA';
      component.postalCode = '10001';
      component.selectedPaymentMethod = 'paypal';
      expect(component.isFormValid()).toBe(true);
    });
  });

  describe('Card Formatting', () => {
    it('should format card number with spaces', () => {
      const event = { target: { value: '4532015112830366' } };
      component.formatCardNumber(event);
      expect(component.cardNumber).toBe('4532 0151 1283 0366');
    });

    it('should format expiry date as MM/YY', () => {
      const event = { target: { value: '1225' } };
      component.formatExpiryDate(event);
      expect(component.expiryDate).toBe('12/25');
    });

    it('should allow only digits in CVV', () => {
      const event = { target: { value: '123abc' } };
      component.formatCVV(event);
      expect(component.cvv).toBe('123');
    });
  });

  describe('Card Type Detection', () => {
    it('should detect Visa', () => {
      component.cardNumber = '4532015112830366';
      expect(component.getCardType()).toBe('Visa');
    });

    it('should detect Mastercard', () => {
      component.cardNumber = '5425233010103442';
      expect(component.getCardType()).toBe('Mastercard');
    });

    it('should return Unknown for invalid card', () => {
      component.cardNumber = '1234567890123456';
      expect(component.getCardType()).toBe('Unknown');
    });
  });

  describe('Payment Processing', () => {
    it('should not process invalid form', async () => {
      component.fullName = '';
      await component.processPayment();
      expect(mockPaymentService.processCardPayment).not.toHaveBeenCalled();
    });

    it('should process card payment when form is valid', async () => {
      component.fullName = 'John Doe';
      component.email = 'john@example.com';
      component.phone = '5551234567';
      component.address = '123 Main St';
      component.city = 'New York';
      component.country = 'USA';
      component.postalCode = '10001';
      component.selectedPaymentMethod = 'card';
      component.cardNumber = '4532015112830366';
      component.cardholderName = 'John Doe';
      component.expiryDate = '12/25';
      component.cvv = '123';

      mockPaymentService.processCardPayment.and.returnValue(Promise.resolve(true));

      await component.processPayment();
      expect(mockPaymentService.processCardPayment).toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    it('should show card details only when card payment is selected', () => {
      component.selectedPaymentMethod = 'card';
      expect(component.showCardDetails()).toBe(true);

      component.selectedPaymentMethod = 'paypal';
      expect(component.showCardDetails()).toBe(false);
    });

    it('should get last 4 digits of card', () => {
      component.cardNumber = '4532 0151 1283 0366';
      expect(component.getCardLastFour()).toBe('0366');
    });
  });
});
