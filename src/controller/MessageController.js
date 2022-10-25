import Model from "../model/Model";

import {
  Contact,
  Image,
  File,
  Text,
  Audio,
} from "../components/Messages/index";

export class MessageController extends Model {
  constructor() {
    super();
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
    }

    let className = me ? "message-out" : "message-in";
    div.firstElementChild.classList.add(className);

    return div;
  }
}
