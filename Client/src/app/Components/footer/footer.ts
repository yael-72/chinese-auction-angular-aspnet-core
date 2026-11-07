import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  socialLinks = [
    { name: 'Facebook', icon: 'pi pi-facebook', url: '#' },
    { name: 'Instagram', icon: 'pi pi-instagram', url: '#' },
    { name: 'Twitter', icon: 'pi pi-twitter', url: '#' },
    { name: 'LinkedIn', icon: 'pi pi-linkedin', url: '#' }
  ];

  footerLinks = [
    {
      title: 'About',
      links: [
        { label: 'About Us', url: '#' },
        { label: 'Our Mission', url: '#' },
        { label: 'Our Team', url: '#' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'FAQ', url: '#' },
        { label: 'Contact Us', url: '#' },
        { label: 'Help Center', url: '#' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', url: '#' },
        { label: 'Terms of Service', url: '#' },
        { label: 'Cookie Policy', url: '#' }
      ]
    }
  ];
}
