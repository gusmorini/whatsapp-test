import { Firebase } from "../database/firebase";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";

export default class Upload {
  static uploadFile(from, file) {
    return new Promise((resolve, reject) => {
      const split = file.name.split(".");
      const ext = split[split.length - 1];
      const filename = `file${Date.now()}.${ext}`;
      const fileRef = `${from}/${filename}`;
      const storageRef = ref(Firebase.hd(), fileRef);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          console.info("--uploading ... ", snapshot);
        },
        (err) => reject(err),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
            resolve(downloadURL)
          );
        }
      );
    });
  }
}
