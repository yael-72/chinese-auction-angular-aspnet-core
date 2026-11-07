import { HttpClient , HttpParams} from '@angular/common/http';
import { inject,Injectable } from '@angular/core';
import { Gift } from '../model/gift.model';

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class GiftCrud {
  httpClient: HttpClient = inject(HttpClient)
  URL: string = 'https://localhost:7128/api/Gift'

// getGifts(name?: string, donorName?: string, amount?: number, sort?: string): Observable<any[]> {
//     let params = new HttpParams();

//     if (name) params = params.append('name', name);
//     if (donorName) params = params.append('donorName', donorName);
//     if (amount) params = params.append('amount', amount.toString());
//     if (sort) params = params.append('sort', sort);

//     return this.http.get<any[]>(this.apiUrl, { params });
//   }
 
  getAll(name?:string|null, donorName?:string|null, amount?:number|null, sort?:string|null){
    let params = new HttpParams();
    if (name) params = params.append('name', name);
    if (donorName) params = params.append('donorName', donorName);
    if (amount) params = params.append('amount', amount.toString());
    if (sort) params = params.append('sort', sort);
    return this.httpClient.get<Gift[]>(this.URL,{params})

  }

  update(item: Gift){
    return this.httpClient.put<ApiResponse<Gift>>(this.URL,item)
  }

  add(item: Gift){
    return this.httpClient.post<ApiResponse<Gift>>(this.URL,item)
  }
  
  getById(id:number){
    return this.httpClient.get<Gift>(this.URL + '/' + id)
  }

  delete(id:number){
    return this.httpClient.delete<ApiResponse<void>>(this.URL + '/' + id)
  }
  deleteAll(){
    return this.httpClient.delete<ApiResponse<void>>(this.URL + '/all')
  }
 
}
