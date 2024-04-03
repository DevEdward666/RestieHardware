import { useState, useEffect } from "react";
import { isPlatform } from "@ionic/react";

import {
  Camera,
  CameraResultType,
  CameraSource,
  Photo,
} from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { UserPhoto } from "../Models/Request/Inventory/InventoryModel";

export function usePhotoGallery() {
  const [file, setFile] = useState<File | undefined>();
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const takePhoto = async () => {
    try {
      const cameraperm = (await Camera.checkPermissions()).camera;
      if (cameraperm === "denied") {
        const cameraperm2 = (await Camera.requestPermissions()).camera;
        console.log(cameraperm2);
      }
      console.log(cameraperm);
      const photo = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      const blob = await fetch(photo.webPath!).then((r) => r.blob());
      const file = new File([blob], Date.now() + ".jpeg", {
        type: "image/jpeg",
      });
      setFile(file);
    } catch (error) {
      console.error("Error taking photo", error);
      return null;
    }
  };

  return {
    file,
    takePhoto,
  };
}
