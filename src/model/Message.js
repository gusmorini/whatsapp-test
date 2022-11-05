import Model from "../model/Model";
import Format from "../util/Format";

import { collection, addDoc, setDoc } from "firebase/firestore";
import { Firebase } from "../database/firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";

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

  /** get set type document */

  get filename() {
    return this._data.filename;
  }
  set filename(value) {
    return (this._data.filename = value);
  }

  get pages() {
    return this._data.pages;
  }
  set pages(value) {
    return (this._data.pages = value);
  }

  get ext() {
    return this._data.ext;
  }
  set ext(value) {
    return (this._data.ext = value);
  }

  get size() {
    return this._data.size;
  }
  set size(value) {
    return (this._data.size = value);
  }

  get icon() {
    return this._data.icon;
  }
  set icon(value) {
    return (this._data.icon = value);
  }

  getViewElement(me = true) {
    let div = document.createElement("div");
    div.className = "message";
    div.id = "_" + this.id;

    switch (this.type) {
      case "contact":
        div.innerHTML = Contact;
        div.querySelector("#name-contact-sended").innerHTML = this.content.name;
        if (this.content.photo) {
          let img = div.querySelector("#photo-contact-sended");
          img.src = this.content.photo;
          img.show();
        }
        div.querySelector("#btn-contact-sended").on("click", (e) => {
          console.log("ENVIAR MENSAGEM");
        });
        break;
      case "image":
        div.innerHTML = Image;
        Message.showImage(div, this.content);
        break;
      case "document":
        div.innerHTML = File;
        div.querySelector(".message-file-icon").classList.add(this.icon);
        div.querySelector(".message-filename").innerHTML = this.filename;
        if (this.pages) {
          div.querySelector(".message-file-info").innerHTML = this.pages;
        } else {
          div.querySelector(".message-file-info").remove();
        }
        div.querySelector(".message-file-type").innerHTML = this.ext;
        div.querySelector(".message-file-size").innerHTML = this.size;
        if (this.content) {
          Message.createLinkOpen(div, this.content);
        }
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
      Message.setStatusViewElement(div, this.getStatusViewElement());
    }

    div.firstElementChild.classList.add(className);

    return div;
  }

  static showImage(messageEl, src) {
    messageEl.querySelector(".message-photo").src = src;
    messageEl.querySelector(".message-photo").on("load", (e) => {
      messageEl
        .querySelector("._3v3PK")
        .css({
          height: "auto",
        })
        .on("click", (e) => window.open(src));
      messageEl.querySelector("._34Olu").hide();
      messageEl.querySelector(".message-photo").show();
    });
  }

  static createLinkOpen(el, content) {
    el.querySelector(".message-file-load").hide();
    el.querySelector("._1vKRe").on("click", (e) => window.open(content));
  }

  static setStatusViewElement(el, view) {
    el.querySelector(".message-time").parentElement.appendChild(view);
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

  static send(
    chatId,
    from,
    type,
    content = "",
    filename = "",
    pages = "",
    ext = "",
    size = 0,
    icon = ""
  ) {
    return addDoc(Message.getRefCollection(chatId), {
      content,
      time: new Date(),
      status: "wait",
      from,
      type,
      filename,
      pages,
      ext,
      size,
      icon,
    });
  }

  static sendContact(chatId, from, contact) {
    Message.send(chatId, from, "contact", contact)
      .then((doc) =>
        Message.setData(doc, {
          status: "sent",
        })
      )
      .catch((err) => console.err(err));
  }

  static sendText(chatId, from, message) {
    Message.send(chatId, from, "text", message).then((doc) =>
      Message.setData(doc, {
        status: "sent",
      }).catch((err) => console.error(err))
    );
  }

  static sendImage(chatId, from, file) {
    Message.send(chatId, from, "image", "").then((doc) => {
      Message.uploadFile(from, file)
        .then((downloadURL) => {
          Message.setData(doc, {
            content: downloadURL,
            status: "sent",
          });
        })
        .catch((err) => console.error(err));
    });
  }

  static sendDocument(chatId, from, data) {
    Message.send(
      chatId,
      from,
      "document",
      "",
      data.file.name,
      data.pages || "",
      data.ext,
      data.file.size,
      data.icon
    )
      .then((doc) => {
        Message.uploadFile(from, data.file)
          .then((url) => {
            Message.setData(doc, {
              content: url,
              status: "sent",
            });
          })
          .catch((err) => console.error(err));
      })
      .catch((err) => console.error(err));
  }

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
          console.info(" --- upload: ", snapshot);
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

  static getRefCollection(chatId) {
    return collection(Firebase.db(), `chats/${chatId}/messages`);
  }

  static setStatus(doc, status = "wait") {
    return setDoc(doc, { status: status }, { merge: true });
  }

  static setData(ref, data = {}) {
    return setDoc(ref, data, { merge: true });
  }
}
