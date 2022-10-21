import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";

import { Model } from "./Model";

export class User extends Model {
  constructor(id) {
    super();
    this._db = getFirestore();
    this._ref = "users";
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

  getById(id) {
    const docRef = doc(this._db, this._ref, id);
    onSnapshot(docRef, (doc) => {
      this.fromJSON(doc.data());
    });
  }

  save() {
    return setDoc(doc(this._db, this._ref, this.email), this.toJSON());
  }
}
