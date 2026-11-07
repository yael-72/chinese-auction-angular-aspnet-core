import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Catergory } from '../model/category.model';

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class Categoryservice {
  httpClient:HttpClient=inject(HttpClient)
  URL: string = 'https://localhost:7128/api/Category'

  add(category:string){
    return this.httpClient.post<ApiResponse<Catergory>>(this.URL,{name:category})
  }

  get(){
    return this.httpClient.get<Catergory[]>(this.URL)
  }

  delete(id:number){
    return this.httpClient.delete<ApiResponse<Catergory>>(this.URL+"/"+id)
  }

}
