import { Component, OnInit } from '@angular/core';
import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { Router } from "@angular/router";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import * as fs from 'fs';
import { CookieService } from "ngx-cookie-service";
import { Cancion } from 'src/clases/cancion';
import { fromEvent } from 'rxjs';
import { CancionesServiceService } from 'src/Service/canciones-service.service';
import { PlayerServiceService } from 'src/Service/player-service.service';
import { ListaCancionesAuxService } from 'src/Service/lista-canciones-aux.service';
import { ParserServiceService } from 'src/Service/parser-service.service';


@Component({
  selector: 'mf-crud-premium',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  newSearch$ = fromEvent(window, "newSearch");

  title = 'mf-crud-premium';
  storageAccountName = 'soakaraokestorage';
  listaDeCacniones: Cancion[] = [];
  cancionActual: Cancion = new Cancion();
  cancionSubir: Cancion = new Cancion();
  public loading = false;
  constructor(private router: Router, private service: CancionesServiceService, private playerAux: PlayerServiceService,
    private cookieService: CookieService, private listaCancionesService: ListaCancionesAuxService, private parser: ParserServiceService) { }

  ngOnInit(): void {
    this.cookieService.set('tipoVistaActual', 'premium');
    this.listaCancionesService.sharedListaCanciones.subscribe(listaCanciones => this.listaDeCacniones = listaCanciones)
    this.service.obtenerListaCancionesPrivadas().subscribe(lista => {
      this.listaDeCacniones = lista;
      console.log(lista)
    })
    this.validating();
  }

  validating() {
    this.newSearch$.subscribe((resp: any) => {
      console.log(resp);
      this.listaDeCacniones =resp.detail;
    })
  }


  fileContent: string = '';


  public crearCancion(): void {
    this.cancionSubir.letra = this.playerAux.letra;
    this.cancionSubir.owner = JSON.parse(this.cookieService.get('user')).username
    this.service.subirUnaCancion(this.cancionSubir).subscribe(respuesta => {
      console.log(respuesta);
      // @ts-ignore
      this.cancionSubir.filename = respuesta.song.filename;
      console.log(this.cancionSubir)
      this.uploadFileToBlob(this.cancionSubir.filename);
      this.ngOnInit()
    }, error => console.log(error))
  }

  public itemActual(item: Cancion) {
    this.cancionActual = item;
  }
  public ediarCancionLetra() {
    this.cancionActual.letra = this.playerAux.letra;
    this.service.editarCancion(this.cancionActual._id, this.cancionActual).subscribe(respuesta => {
      console.log(respuesta)
      this.ngOnInit();
    })
  }

  public editarCancionMusica(): void {
    this.uploadFileToBlob(this.cancionActual.filename);
    this.ngOnInit();
  }

  public eliminarCancion(): void {
    this.service.eliminarCancion(this.cancionActual._id).subscribe(respuesta => {
      console.log(respuesta)
      this.ngOnInit();
    })
  }

  public navigate(comprobacion: string): void {
    if (comprobacion === 'UsuarioPremium') {
    }
  }


  public IrAStrem(item: Cancion): void {
    this.playerAux.cancion = item;
    this.service.saveCancionStream(item)
    this.router.navigateByUrl('/stream');

  }

  fileSelected: any;

  actualizarFile = async (event: any): Promise<void> => {
    this.fileSelected = event.target.files[0]
  }

  public async uploadFileToBlob(fileName: string): Promise<void> {
    let file = this.fileSelected;
    if (!file) return;

    // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
    const blobService = new BlobServiceClient(
      "https://" + this.storageAccountName + ".blob.core.windows.net/?" + this.cookieService.get('key')
    );

    // get Container - full public read access
    const containerClient: ContainerClient = blobService.getContainerClient(JSON.parse(this.cookieService.get('user')).username);

    await this.createBlobInContainer(containerClient, file, fileName);
  };

  createBlobInContainer = async (containerClient: ContainerClient, file: File, fileName: string) => {

    // create blobClient for container
    const blobClient = containerClient.getBlockBlobClient(fileName);

    // set mimetype as determined from browser with file upload control
    const options = { blobHTTPHeaders: { blobContentType: file.type } };
    // upload file
    this.loading = true;
    await blobClient.uploadBrowserData(file, options);
    this.loading = false;
  }


  public onChange(event: any): void {
    let fileList = event.target.files;
    let file = fileList[0];
    let fileReader: FileReader = new FileReader();
    let self = this;
    fileReader.onloadend = function (x) {
      self.parser.lyrics = (fileReader.result) ? fileReader.result.toString() : "";
      self.playerAux.letra = self.parser.tomsify().letra;
    }
    fileReader.readAsText(file);
  }
}






