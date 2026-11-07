import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { jwtDecode } from "jwt-decode";
import { User } from '../model/user.model';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

interface AuthResponse {
  token?: string;
  message?: string;
  data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class Authservice {
  router=inject(Router)
  httpClient:HttpClient=inject(HttpClient)
  URL:string='https://localhost:7128/api/Auth'
  
  loggedIn=new BehaviorSubject<boolean>(!!localStorage.getItem("token"))
  user=new BehaviorSubject<User | null>(null)

  constructor(){
   if(localStorage.getItem("token"))
      this.user.next(jwtDecode(localStorage.getItem("token")??""))
        //   const token = localStorage.getItem('token');

        // if (token) {
        //   this.loggedIn.next(true);
        //   this.user.next(jwtDecode<User>(token));
        // }
  }
  
  login(userName:string | null , password:string | null){
    return this.httpClient.post<AuthResponse>(this.URL+'/login',{userName,password})
  }

  register(name:any,userName:any,password:any,email:any,phone?:any){
    return this.httpClient.post<AuthResponse>(this.URL+"/register",{name,userName,password,email,phone})
  }

  logout(){
    localStorage.removeItem("token")
    this.loggedIn.next(false)
    this.user.next(null)
  }

}
