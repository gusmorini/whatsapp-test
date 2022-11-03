import Model from "../model/Model";
import Format from "../util/Format";

import { collection, addDoc, setDoc } from "firebase/firestore";
import { Firebase } from "../database/firebase";

import {
  Contact,
  Image,
  File,
  Text,
  Audio,
} from "../components/Messages/index";

import { Read, Received, Sent, Wait } from "../components/Status/index";

export class Message extends Model {
  constructor() {
    super();
  }

  get id() {
    return this._data.id;
  }
  set id(value) {
    return (this._data.id = value);
  }

  get content() {
    return this._data.content;
  }
  set content(value) {
    return (this._data.content = value);
  }

  get type() {
    return this._data.type;
  }
  set type(value) {
    return (this._data.type = value);
  }

  get time() {
    return this._data.time;
  }
  set time(value) {
    return (this._data.time = value);
  }

  get status() {
    return this._data.status;
  }
  set status(value) {
    return (this._data.status = value);
  }

  getViewElement(me = true) {
    let div = document.createElement("div");
    div.className = "message";
    div.id = "_" + this.id;

    switch (this.type) {
      case "contact":
        div.innerHTML = Contact;
        break;
      case "image":
        div.innerHTML = Image;
        break;
      case "document":
        div.innerHTML = File;
        break;
      case "audio":
        div.innerHTML = Audio;
        break;
      default:
        div.innerHTML = Text;
        div.querySelector(".message-text").innerHTML = this.content;
    }

    div.querySelector(".message-time").innerHTML = Format.timeStampToTime(
      this.time
    );

    let className = "message-in";

    /** status message */
    if (me) {
      className = "message-out";
      div
        .querySelector(".message-time")
        .parentElement.appendChild(this.getStatusViewElement());
    }

    div.firstElementChild.classList.add(className);

    return div;
  }

  getStatusViewElement() {
    let div = document.createElement("div");
    div.className = "message-status";

    switch (this.status) {
      case "wait":
        div.innerHTML = Wait;
        break;
      case "sent":
        div.innerHTML = Sent;
        break;
      case "received":
        div.innerHTML = Received;
        break;
      case "read":
        div.innerHTML = Read;
        break;
      default:
    }

    return div;
  }

  static send(chatId, from, type, content) {
    return addDoc(Message.getRefCollection(chatId), {
      content,
      time: new Date(),
      status: "wait",
      from,
      type,
    });
  }

  static getRefCollection(chatId) {
    return collection(Firebase.db(), `chats/${chatId}/messages`);
  }

  static setStatus(doc, status = "wait") {
    return setDoc(doc, { status: status }, { merge: true });
  }
}
