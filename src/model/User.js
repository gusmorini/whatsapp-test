import {
  doc,
  setDoc,
  onSnapshot,
  collection,
  where,
  query,
} from "firebase/firestore";
import { Firebase } from "../database/firebase";
import Model from "./Model";

export class User extends Model {
  constructor(id) {
    super();
    if (id) this.getById(id);
  }

  get name() {
    return this._data.name;
  }
  set name(value) {
    this._data.name = value;
  }

  get email() {
    return this._data.email;
  }
  set email(value) {
    this._data.email = value;
  }

  get photo() {
    return this._data.photo;
  }
  set photo(value) {
    this._data.photo = value;
  }

  get chatId() {
    return this._data.chatId;
  }
  set chatId(value) {
    this._data.chatId = value;
  }

  static getRef() {
    return `users`;
  }

  static getRefContacts(id) {
    return `${this.getRef()}/${id}/contacts`;
  }

  getById(id) {
    const docRef = doc(Firebase.db(), User.getRef(), id);
    onSnapshot(docRef, (doc) => {
      this.fromJSON(doc.data());
    });
  }

  save() {
    // salva dados local storage
    // if (!window.localStorage.getItem("user")) {
    //   window.localStorage.setItem("user", JSON.stringify(this.toJSON()));
    // }
    window.localStorage.setItem("user", JSON.stringify(this.toJSON()));

    // salva dados firebase
    return setDoc(doc(Firebase.db(), User.getRef(), this.email), this.toJSON());
  }

  addContact(contact) {
    return setDoc(
      doc(Firebase.db(), User.getRefContacts(this.email), btoa(contact.email)),
      contact.toJSON()
    );
  }

  getContacts(filter = "") {
    return new Promise((resolve, reject) => {
      onSnapshot(
        query(
          collection(Firebase.db(), User.getRefContacts(this.email)),
          where("name", ">=", filter)
        ),
        ({ docs }) => {
          this.trigger("contactsChange", docs);
          resolve(docs);
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
}
