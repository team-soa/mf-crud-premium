import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import {HttpClient, HttpClientModule, HttpHeaders} from "@angular/common/http";
import { Observable } from 'rxjs';
import { Cancion } from 'src/clases/cancion';

@Injectable({
  providedIn: 'root'
})
export class CancionesServiceService {
  URL = 'http://localhost:4003/songs'
  constructor(private http: HttpClient, private cookieService: CookieService) {
  }

  public saveCancionStream(item: Cancion) {
    this.cookieService.set("streamCancion", item._id);
    this.cookieService.set("artista", item.artista);
  }

  public obtenerListaCancionesPublicas(): Observable<Cancion[]>{
    let options = {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.cookieService.get("token"))
    };
    return this.http.get<Cancion[]>(this.URL, options);
  }
  public obtenerListaCancionesPrivadas(): Observable<Cancion[]>{
    return this.http.get<Cancion[]>(this.URL, {params: {user: JSON.parse(this.cookieService.get("user")).username} , headers:new HttpHeaders().set('Authorization', 'bearer '
        + this.cookieService.get("token"))});
  }
  public subirUnaCancion(cancion: Cancion): Observable<Object>{
    console.log(cancion);
    let options = {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.cookieService.get("token"))
    };
    return this.http.post(this.URL, cancion , options);
  }
  public obtenerCancionPorID(id: string){
    let options = {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.cookieService.get("token"))
    };
    return this.http.get(this.URL + '/' +id , options);
  }
  public editarCancion(id: string, cancion: Cancion){
    let options = {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.cookieService.get("token"))
    };
    return this.http.put(this.URL + '/' + id, cancion , options);
  }
  public eliminarCancion(id: string){
    let options = {
      headers: new HttpHeaders().set('Authorization', 'bearer ' + this.cookieService.get("token"))
    };
    return this.http.delete(this.URL + '/' + id , options);
  }

}
