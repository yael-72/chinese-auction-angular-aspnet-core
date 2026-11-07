import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Ticket } from '../model/ticket.model';

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  httpClient:HttpClient=inject(HttpClient)
  URL:string="https://localhost:7128/api/Ticket"

  add(ticket: any){
    return this.httpClient.post<ApiResponse<void>>(this.URL,ticket)
  }
  getDraft(id:number){
    return this.httpClient.get<Ticket[]>(this.URL+"/draft/"+id)
  }
  getPaid(id:number){
    return this.httpClient.get<Ticket[]>(this.URL+"/paid/"+id)
  }
  getPaidForUser(id:number){
    return this.httpClient.get<Ticket[]>(this.URL+"/user/"+id)
  }
  getWinner(id:number){
    return this.httpClient.get<string>(this.URL+"/winner/"+id)
  }
  getByGiftId(giftId:number){
    return this.httpClient.get<Ticket[]>(this.URL+"/gift/"+giftId)
  }
  pay(id:number){
    console.log("pay in service");
    
    return this.httpClient.put<ApiResponse<void>>(this.URL+"/pay/"+id,{})
  }
  changeAmount(id:number,amount:number){
    return this.httpClient.put<ApiResponse<void>>(this.URL+"/amount/"+id+"?amount="+amount,{})
  }
  delete(id:number){
    return this.httpClient.delete<ApiResponse<void[]>>(this.URL+"/"+id)
  }
}
