import { Component, inject } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Authservice } from '../../../../services/authservice';
import { CommonModule, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Token } from '@angular/compiler';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-register',
  imports: [DividerModule, ButtonModule, InputTextModule, FormsModule, ReactiveFormsModule, ToastModule, NgIf],
  templateUrl: './register.html',
  styleUrl: '../login/login.new.scss',
  providers: [MessageService],
})
export class Register {

  router=inject(Router)
  authSrv:Authservice=inject(Authservice)
  messageService=inject(MessageService)

  regFrm=new FormGroup({
    name:new FormControl<string>('',[Validators.required]),
    userName:new FormControl('',[Validators.required]),
    password:new FormControl('',[Validators.required,Validators.minLength(4)]),
    email:new FormControl('',[Validators.required,Validators.email]),
    phone:new FormControl('',[Validators.required,Validators.pattern('^[0-9]+$')])
  })  

  moveToLogin(){
    this.router.navigate(['/login'])
  }

  register(){
    if (this.regFrm.invalid) {
      this.messageService.add({
        severity: 'warn',
        detail: 'Please fill in all required fields correctly',
        life: 3000
      });
      return;
    }

    this.authSrv.register(
      this.regFrm.controls["name"].value,
      this.regFrm.controls["userName"].value,
      this.regFrm.controls["password"].value,
      this.regFrm.controls["email"].value,
      this.regFrm.controls["phone"].value
    ).subscribe({
      next: (response: any) => {
        if (response?.message) {
          this.messageService.add({
            severity: 'success',
            detail: response.message,
            life: 2000
          });
        }
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err: any) => {
        if (err?.error?.message) {
          this.messageService.add({
            severity: 'error',
            detail: err.error.message,
            life: 3000
          });
        }
      }
    });
  }
}
