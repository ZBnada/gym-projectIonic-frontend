import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root'
})
export class PhotosService {

  //  Prendre une photo avec la caméra
  async takePicture(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      return photo.dataUrl ?? null;
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      return null;
    }
  }

  //  Choisir une photo depuis la galerie
  async pickPicture(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      });
      return photo.dataUrl ?? null;
    } catch (error) {
      console.error('Erreur lors de la sélection depuis galerie:', error);
      return null;
    }
  }
}
