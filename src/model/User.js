import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  getFirestore,
  collection,
} from "firebase/firestore";

import { Model } from "./Model";

export class User extends Model {
  constructor(id) {
    super();
    this._db = getFirestore();
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

  static getRef() {
    return `users`;
  }

  static getRefContacts(id) {
    return `${this.getRef()}/${id}/contacts`;
  }

  getById(id) {
    const docRef = doc(this._db, User.getRef(), id);
    onSnapshot(docRef, (doc) => {
      this.fromJSON(doc.data());
    });
  }

  save() {
    return setDoc(doc(this._db, User.getRef(), this.email), this.toJSON());
  }

  addContact(contact) {
    return setDoc(
      doc(this._db, User.getRefContacts(this.email), btoa(contact.email)),
      contact.toJSON()
    );
  }

  getContacts() {
    onSnapshot(
      collection(this._db, User.getRefContacts(this.email)),
      ({ docs }) => {
        this.trigger("contactsChange", docs);
      },
      (error) => {
        console.error(error);
      }
    );
  }
}
