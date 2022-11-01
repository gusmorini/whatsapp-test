import Model from "../model/Model";
import Format from "../util/Format";

import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { Firebase } from "../database/firebase";

import {
  Contact,
  Image,
  File,
  Text,
  Audio,
} from "../components/Messages/index";

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
        div.querySelector(".msg-time").innerHTML = Format.timeStampToTime(
          this.time
        );
    }

    let className = me ? "message-out" : "message-in";
    div.firstElementChild.classList.add(className);

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
}
