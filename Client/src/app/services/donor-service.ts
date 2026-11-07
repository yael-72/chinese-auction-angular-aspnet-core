import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Donor } from '../model/donor.model';

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class DonorService {
  httpClient:HttpClient=inject(HttpClient)

  URL: string = 'https://localhost:7128/api/Donor'
  
    getAll(){
      return this.httpClient.get<Donor[]>(this.URL)
    }

    searchByName(name: string) {
      return this.httpClient.get<Donor[]>(this.URL,  {params: { name } });
    }
  
    update(item: Donor){
      return this.httpClient.put<ApiResponse<Donor>>(this.URL,item)
    }
  
    add(item: Donor){
      return this.httpClient.post<ApiResponse<Donor>>(this.URL,item)
    }
    
    getById(id:number){
      return this.httpClient.get<Donor>(this.URL + '/' + id)
    }
  
    delete(id:number){
      return this.httpClient.delete<ApiResponse<void>>(this.URL + '/' + id)
    }
}
