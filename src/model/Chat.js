import {
  collection,
  onSnapshot,
  where,
  query,
  getDocs,
  getDoc,
  setDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { Firebase } from "../database/firebase";
import { Model } from "./Model";

export class Chat extends Model {
  constructor() {
    super();
    this._db = getFirestore();
  }

  get users() {
    this._data.users;
  }
  set users(value) {
    this._data.users = value;
  }

  get time() {
    this._data.time;
  }
  set time(value) {
    this._data.time = value;
  }

  static getRefCollection() {
    return collection(Firebase.db(), "chats");
  }

  static findExists(userEmail, contactEmail) {
    const q = query(
      Chat.getRefCollection(),
      where(btoa(userEmail), "==", true),
      where(btoa(contactEmail), "==", true)
    );
    return getDocs(q);
  }

  static create(userEmail, contactEmail) {
    let users = {};
    users[btoa(userEmail)] = true;
    users[btoa(contactEmail)] = true;
    return addDoc(Chat.getRefCollection(), {
      users,
      time: new Date(),
    });
  }

  static getChat(id) {
    return getDoc(doc(Firebase.db(), "chats", id));
  }

  static createIfNotExists(userEmail, contactEmail) {
    return new Promise((resolve, reject) => {
      Chat.findExists(userEmail, contactEmail)
        .then((chats) => {
          console.log("CHATS FIND", chats);
          if (chats.empty) {
            Chat.create(userEmail, contactEmail)
              .then((doc) => {
                Chat.getChat(doc.id).then((chat) => {
                  let data = chat.data();
                  data.id = doc.id;
                  resolve(data);
                });
              })
              .catch((err) => reject(err));
          } else {
            chats.forEach((chat) => resolve(chat));
          }
        })
        .catch((err) => reject(err));
    });
  }
}
