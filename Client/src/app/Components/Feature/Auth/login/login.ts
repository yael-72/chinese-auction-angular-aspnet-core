import { Component, inject } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Authservice } from '../../../../services/authservice';
import { CommonModule, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Token } from '@angular/compiler';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { jwtDecode } from 'jwt-decode';
import { SystemMessageService } from '../../../shared/system-message/system-message.component';

@Component({
  selector: 'app-login',
  imports: [DividerModule, ButtonModule, InputTextModule, FormsModule, ToastModule, ReactiveFormsModule, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.new.scss'
})
export class Login {
  private router = inject(Router);
  private authSrv: Authservice = inject(Authservice);
  private systemMessageService = inject(SystemMessageService);

  loginFrm = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  get f() {
    return this.loginFrm.controls;
  }

  login(): void {
    if (!this.f['userName'].value || !this.f['password'].value) {
      this.systemMessageService.warning('Validation Error', 'Please fill in all fields');
      return;
    }

    this.authSrv.login(this.f['userName'].value, this.f['password'].value).subscribe({
    next: (response: any) => {
      const message = response?.message ?? 'Login successful';
      if (response?.token) {
        this.authSrv.loggedIn.next(true);
        this.authSrv.user.next(jwtDecode(response.token));
        localStorage.setItem("token", response.token);
        
        this.systemMessageService.success('Success', message);
        
        setTimeout(() => {
          this.router.navigate(['/gift']);
        }, 1000);
      }
    },
    error: (err: any) => {
      const detail = err?.error?.message ?? 'Login failed';
      this.systemMessageService.error('Error', detail);
    }
  });
}

moveToRegister(): void {
    this.router.navigate(['/register']);
  }
}
