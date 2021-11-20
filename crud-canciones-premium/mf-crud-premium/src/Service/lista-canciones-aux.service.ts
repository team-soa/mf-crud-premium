import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cancion } from 'src/clases/cancion';

@Injectable({
  providedIn: 'root'
})
export class ListaCancionesAuxService {

  private listaCanciones = new BehaviorSubject([new Cancion()]);
  sharedListaCanciones = this.listaCanciones.asObservable();

  constructor() { }

  nextListaDeCanciones(listaCanciones: Cancion[]) {
    this.listaCanciones.next(listaCanciones)
  }
}
