import { Injectable } from '@angular/core';
import { Cancion } from 'src/clases/cancion';

@Injectable({
  providedIn: 'root'
})
export class PlayerServiceService {
  public letra: {words:string, second:number}[] = []
  public fileName: string = ''

  public cancion: Cancion= new Cancion();

}
