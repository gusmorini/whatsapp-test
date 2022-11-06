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

  /** get set audio */

  get photo() {
    return this._data.photo;
  }
  set photo(value) {
    return (this._data.photo = value);
  }

  get duration() {
    return this._data.duration;
  }
  set duration(value) {
    return (this._data.duration = value);
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

        if (this.photo) {
          let img = div.querySelector(".message-photo");
          img.src = this.photo;
          img.show();
        }

        let audioEl = div.querySelector("audio");
        audioEl.src = this.content;

        let loadEl = div.querySelector(".audio-load");
        let playEl = div.querySelector(".audio-play");
        let pauseEl = div.querySelector(".audio-pause");
        let inputRange = div.querySelector("[type=range]");
        let currentEl = div.querySelector(
          ".message-audio-duration span.current"
        );

        let durationEl = div.querySelector(
          ".message-audio-duration span.duration"
        );

        durationEl.innerHTML = Format.toTime(this.duration * 1000);

        audioEl.onloadeddata = (e) => {
          loadEl.hide();
          playEl.show();
        };

        audioEl.onplay = (e) => {
          playEl.hide();
          pauseEl.show();
        };

        audioEl.onpause = (e) => {
          currentEl.innerHTML = Format.toTime(this.duration * 1000);
          pauseEl.hide();
          playEl.show();
        };

        audioEl.onended = (e) => {
          audioEl.currentTime = 0;
        };

        audioEl.ontimeupdate = (e) => {
          currentEl.innerHTML = Format.toTime(audioEl.currentTime * 1000);
          inputRange.value = (audioEl.currentTime * 100) / this.duration;
        };

        playEl.on("click", () => audioEl.play());
        pauseEl.on("click", () => audioEl.pause());

        inputRange.on("change", (e) => {
          audioEl.currentTime = (inputRange.value * this.duration) / 100;
        });

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

  static send({
    chatId,
    from,
    type,
    content = "",
    filename = "",
    pages = "",
    ext = "",
    size = 0,
    icon = "",
    photo = "",
    duration = 0,
  }) {
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
      photo,
      duration,
    });
  }

  static sendAudio(chatId, from, file, metadata, photo) {
    Message.send({
      chatId,
      from,
      type: "audio",
      photo,
      duration: metadata.duration,
    }).then((doc) => {
      Message.uploadFile(from, file).then((url) => {
        Message.setData(doc, {
          status: "sent",
          content: url,
        });
      });
    });
  }

  static sendContact(chatId, from, contact) {
    Message.send({ chatId, from, type: "contact", content: contact })
      .then((doc) =>
        Message.setData(doc, {
          status: "sent",
        })
      )
      .catch((err) => console.err(err));
  }

  static sendText(chatId, from, message) {
    Message.send({ chatId, from, type: "text", content: message }).then((doc) =>
      Message.setData(doc, {
        status: "sent",
      }).catch((err) => console.error(err))
    );
  }

  static sendImage(chatId, from, file) {
    Message.send({ chatId, from, type: "image" }).then((doc) => {
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
    Message.send({
      chatId,
      from,
      type: "document",
      filename: data.file.name,
      pages: data.pages || "",
      ext: data.ext,
      size: data.file.size,
      icon: data.icon,
    })
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
