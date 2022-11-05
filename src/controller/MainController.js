import Format from "../util/Format";
import Base64 from "../util/Base64";
import PrototypesController from "./PrototypesController";
import CameraController from "./CameraController";
import MicrophoneController from "./MicrophoneController";
import DocumentPreviewController from "./DocumentPreviewController";

import { Firebase } from "../database/firebase";
import { onSnapshot, orderBy, query, setDoc } from "firebase/firestore";

import { User } from "../model/User";
import { Chat } from "../model/Chat";
import { Message } from "../model/Message";

export default class MainController {
  constructor() {
    this._firebase = new Firebase();

    this.authUser();

    PrototypesController.elementsPrototype();
    /**
     * método para carregar todos os
     * elementos com id do DOM e formatar
     * nomes em camel case
     */
    this.loadElements();
    /**
     * método adiciona eventos aos elementos iniciais
     */
    this.initEvents();
  }

  authUser() {
    const usersRef = "users";

    this._firebase
      .auth()
      .then((resp) => {
        this._user = new User(resp.user.email);

        this._user.on("datachange", ({ email, name, photo }) => {
          document.querySelector("title").innerHTML = name + " - WhatsApp Test";
          this.el.inputNamePanelEditProfile.innerHTML = name;
          if (photo) {
            let photo1 = this.el.imgPanelEditProfile;
            photo1.src = photo;
            photo1.show();
            this.el.imgDefaultPanelEditProfile.hide();
            let photo2 = this.el.myPhoto.querySelector("img");
            photo2.src = photo;
            photo2.show();
          }
        });

        this._user.name = resp.user.displayName;
        this._user.email = resp.user.email;
        this._user.photo = resp.user.photoURL;

        this._user.save().then(() => {
          this.el.loader.hide();
          this._user.getContacts();

          this._user.on("contactsChange", (docs) => {
            this.el.contactsMessagesList.innerHTML = "";

            docs.forEach((doc) => {
              const contact = doc.data();

              let el = this.el.cloneElements
                .querySelector(".contact-item")
                .cloneNode(true);

              if (contact.photo) {
                el.querySelector(".photo").show().src = contact.photo;
              }

              let nameEl = el.querySelector(".name-contact");
              nameEl.title = contact.name;
              nameEl.innerHTML = contact.name;
              el.querySelector(".last-message-time").innerHTML = "00:00";
              el.querySelector(".last-message").innerHTML = "...";
              this.el.contactsMessagesList.append(el);

              el.on("click", (e) => {
                this.setActiveChat(contact);
              });
            });
          });
        });
      })
      .catch((err) => console.error(err));
  }

  setActiveChat(contact) {
    /** removendo o onSnapshot antigo se existir */
    if (this._contactActive) {
      onSnapshot(
        Message.getRefCollection(this._contactActive.chatId),
        () => {}
      );
    }

    this._contactActive = contact;
    this.el.activeName.title = contact.name;
    this.el.activeName.innerHTML = contact.name;
    this.el.activeStatus.innerHTML = "...";
    if (contact.photo) {
      this.el.activePhoto.src = contact.photo;
      this.el.activePhoto.show();
    }
    this.el.home.hide();
    this.el.main.css({ display: "flex" });

    this.el.panelMessagesContainer.innerHTML = "";

    /** snapShot tempo real mensagem atual */
    onSnapshot(
      query(
        Message.getRefCollection(this._contactActive.chatId),
        orderBy("time", "asc")
      ),
      ({ docs }) => {
        /** variaveis scroll */
        let scrollTop = this.el.panelMessagesContainer.scrollTop;
        let scrollTopMax =
          this.el.panelMessagesContainer.scrollHeight -
          this.el.panelMessagesContainer.offsetHeight;
        let autoScroll = scrollTop >= scrollTopMax;

        /** percorrendo a collection */
        docs.forEach((doc) => {
          let data = doc.data();
          data.id = doc.id;

          let message = new Message();
          message.fromJSON(data);

          let msgEl = this.el.panelMessagesContainer.querySelector(
            "#_" + data.id
          );

          let me = data.from === this._user.email;

          if (!msgEl) {
            if (!me) {
              Message.setData(doc.ref, { status: "read" });
            }
            let view = message.getViewElement(me);
            this.el.panelMessagesContainer.appendChild(view);
          } else {
            if (me) {
              msgEl.querySelector(".message-status").remove();
              Message.setStatusViewElement(
                msgEl,
                message.getStatusViewElement()
              );
            }

            let photoEl = msgEl.querySelector(".message-photo");

            /** carrega imagem após upload completo */
            if (photoEl && photoEl.style.display == "none" && data.content) {
              Message.showImage(msgEl, data.content);
            }

            let docEl = msgEl.querySelector(".message-file-load");

            /** carrega link documento após upload */
            if (docEl && docEl.style.display == "block" && data.content) {
              Message.createLinkOpen(msgEl, data.content);
            }
          }
        });

        /** controle scroll */
        if (autoScroll) {
          this.el.panelMessagesContainer.scrollTop =
            this.el.panelMessagesContainer.scrollHeight -
            this.el.panelMessagesContainer.offsetHeight;
        } else {
          this.el.panelMessagesContainer.scrollTop = scrollTop;
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  loadElements() {
    this.el = {};
    document.querySelectorAll("[id").forEach((element) => {
      this.el[Format.getElementCase(element.id)] = element;
    });
  }

  initEvents() {
    /** ---- mostra painel editar profile ---- */
    this.el.myPhoto.on("click", (e) => {
      this.closeAllPanelLeft();
      this.el.panelEditProfile.show();
      setTimeout(() => this.el.panelEditProfile.addClass("open"), 300);
    });

    /** ---- oculta painel editar profile ---- */
    this.el.btnClosePanelEditProfile.on("click", (e) => {
      this.el.panelEditProfile.removeClass("open");
    });

    /** procurar contato */
    this.el.inputContactSearch.on("keyup", (e) => {
      const { value } = e.target;

      if (value.length > 0) {
        this.el.inputContactSearchPlaceholder.hide();
      } else {
        this.el.inputContactSearchPlaceholder.show();
      }

      this._user.getContacts(value);
    });

    /** ---- mostra painel adicionar contact ---- */
    this.el.btnNewContact.on("click", (e) => {
      this.closeAllPanelLeft();
      this.el.panelAddContact.show();
      setTimeout(() => this.el.panelAddContact.addClass("open"), 300);
    });

    /** ---- oculta painel adicionar contact ---- */
    this.el.btnClosePanelAddContact.on("click", (e) => {
      this.el.panelAddContact.removeClass("open");
    });

    /** ---- captura imagem usuario ---- */
    this.el.imgDefaultPanelEditProfile.on("click", (e) => {
      this.el.inputProfilePhoto.click();
    });

    /** ---- captura texto profile e click ao pressionar enter ---- */
    this.el.inputNamePanelEditProfile.on("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        this.el.btnSavePanelEditProfile.click();
      }
    });

    /** ---- click btn save profile ---- */
    this.el.btnSavePanelEditProfile.on("click", () => {
      this._user.name = this.el.inputNamePanelEditProfile.innerHTML;
      this.el.btnSavePanelEditProfile.disabled = true;
      this._user
        .save()
        .then(() => (this.el.btnSavePanelEditProfile.disabled = false));
    });

    /** ---- form add contact ---- */
    this.el.formPanelAddContact.on("submit", (e) => {
      e.preventDefault();
      let { email } = this.el.formPanelAddContact.toJSON();

      let contact = new User(email);

      contact.on("datachange", (data) => {
        if (data.name) {
          Chat.createIfNotExists(this._user.email, contact.email)
            .then((chat) => {
              // adiciona o chat id ao contato
              contact.chatId = chat.id;
              // adiciona o chat id ao usuario logado
              this._user.chatId = chat.id;
              // adiciona o usuario logado a lista de contatos
              // do contado a ser adicionado
              contact.addContact(this._user);
              // adiciona o novo contato ao usuario logado
              this._user
                .addContact(contact)
                .then(() => {
                  this.el.btnClosePanelAddContact.click();
                })
                .catch((err) => console.error(err));
            })
            .catch((err) => console.error(err));
        } else {
          console.error("USUARIO NÃO ENCONTRADO");
        }
      });
    });

    /** ---- eventos lista mensagens ---- */
    this.el.contactsMessagesList
      .querySelectorAll(".contact-item")
      .forEach((item) => {
        item.on("click", (e) => {
          this.el.home.hide();
          this.el.main.css({
            display: "flex",
          });
        });
      });

    /** ---- evento menu attach ---- */
    this.el.btnAttach.on("click", (e) => {
      e.stopPropagation();
      this.el.menuAttach.addClass("open");
      document.addEventListener("click", this.closeMenuAttach.bind(this));
    });

    /** ---- item photo ---- */
    this.el.btnAttachPhoto.on("click", () => {
      this.el.inputPhoto.click();
    });
    this.el.inputPhoto.on("change", (e) => {
      [...e.target.files].forEach((file) => {
        Message.sendImage(this._contactActive.chatId, this._user.email, file);
      });
    });

    /** ---- item camera ---- */
    this.el.btnAttachCamera.on("click", () => {
      this.closeAllMainPainel();
      this.el.panelCamera.addClass("open"), 300;
      this.el.panelCamera.css({
        height: "calc(100%)",
      });
      this._camera = new CameraController(this.el.videoCamera);
      this.el.videoCamera.show();
    });
    this.el.btnClosePanelCamera.on("click", () => {
      this._camera.stop();
      this.el.btnReshootPanelCamera.click();
      this.closeAllMainPainel();
      this.el.panelMessagesContainer.show();
    });
    this.el.btnTakePicture.on("click", (e) => {
      this.el.pictureCamera.src = this._camera.takePicture();
      this.el.pictureCamera.show();
      this.el.videoCamera.hide();
      this.el.btnReshootPanelCamera.show();
      this.el.containerTakePicture.hide();
      this.el.containerSendPicture.show();
    });
    this.el.btnReshootPanelCamera.on("click", (e) => {
      this.el.pictureCamera.hide();
      this.el.videoCamera.show();
      this.el.btnReshootPanelCamera.hide();
      this.el.containerTakePicture.show();
      this.el.containerSendPicture.hide();
    });
    this.el.btnSendPicture.on("click", (e) => {
      this.el.btnClosePanelCamera.click();
      /** rotacionando image */
      let picture = new Image();
      picture.src = this.el.pictureCamera.src;
      const mimeType = Base64.getMimeType(picture.src);
      picture.onload = (e) => {
        let canvas = document.createElement("canvas");
        let context = canvas.getContext("2d");
        canvas.width = picture.width;
        canvas.height = picture.height;
        /** translate imagem horizontal */
        context.translate(picture.width, 0);
        /** faz o flip vertical */
        context.scale(-1, 1);
        context.drawImage(picture, 0, 0, canvas.width, canvas.height);
        /** gera o base64 da nova imagem */
        let pictureBase64 = canvas.toDataURL(mimeType);
        /** converte base64 em File */
        Base64.toFile(pictureBase64)
          .then((file) =>
            Message.sendImage(
              this._contactActive.chatId,
              this._user.email,
              file
            )
          )
          .catch((err) => console.error(err));
      };
    });

    /** ---- item documento ---- */
    this.el.btnAttachDocument.on("click", () => {
      this.closeAllMainPainel();
      this.el.panelDocumentPreview.addClass("open");
      this.el.panelDocumentPreview.css({
        height: "calc(100%)",
      });
      this.el.inputDocument.click();
      this.el.btnSendDocument.hide();
    });
    this.el.inputDocument.on("change", (e) => {
      if (this.el.inputDocument.files.length) {
        let file = this.el.inputDocument.files[0];
        this._document = new DocumentPreviewController(file);
        this._document
          .getPreviewData()
          .then((doc) => {
            this.el.btnSendDocument.css({
              display: "flex",
            });

            const { preview, file, icon } = doc;

            if (preview) {
              this.el.imgPanelDocumentPreview.src = preview;
              this.el.infoPanelDocumentPreview.innerHTML = file.name;
              this.el.imagePanelDocumentPreview.show();
              this.el.filePanelDocumentPreview.hide();
            } else {
              this.el.iconPanelDocumentPreview.classList = "jcxhw " + icon;
              this.el.filenamePanelDocumentPreview.innerHTML = file.name;
              this.el.imagePanelDocumentPreview.hide();
              this.el.filePanelDocumentPreview.show();
            }

            this._document._data = doc;
          })
          .catch((err) => console.error(err));
      }
    });
    this.el.btnClosePanelDocumentPreview.on("click", (e) => {
      this.closeAllMainPainel();
      this.el.panelMessagesContainer.show();
      this.el.imagePanelDocumentPreview.hide();
      this.el.filePanelDocumentPreview.hide();
    });
    this.el.btnSendDocument.on("click", (e) => {
      this.el.btnClosePanelDocumentPreview.click();
      Message.sendDocument(
        this._contactActive.chatId,
        this._user.email,
        this._document._data
      );
    });

    /** ---- item contato ---- */
    this.el.btnAttachContact.on("click", () => {
      this.el.modalContacts.show();
    });
    this.el.btnCloseModalContacts.on("click", (e) =>
      this.el.modalContacts.hide()
    );

    /** ---- eventos microfone ---- */
    this.el.btnSendMicrophone.on("click", (e) => {
      this.el.recordMicrophone.show();
      this.el.btnSendMicrophone.hide();
      this._microphone = new MicrophoneController();

      this._microphone.on("ready", (stream) => {
        this._microphone.startRecorder();
      });

      this._microphone.on("recordTimer", (duration) => {
        this.el.recordMicrophoneTimer.innerHTML = Format.toTime(duration);
      });
    });
    this.el.btnCancelMicrophone.on("click", (e) => {
      this.closeRecordMicrophone();
      this._microphone.stopRecorder();
    });
    this.el.btnFinishMicrophone.on("click", (e) => {
      this.closeRecordMicrophone();
      this._microphone.stopRecorder();
    });

    /** ---- eventos caixa de msg ---- */
    this.el.inputText.on("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.el.btnSend.click();
      }
    });
    this.el.inputText.on("keyup", (e) => {
      if (this.el.inputText.innerHTML.length) {
        this.el.inputPlaceholder.hide();
        this.el.btnSendMicrophone.hide();
        this.el.btnSend.show();
      } else {
        this.el.inputPlaceholder.show();
        this.el.btnSendMicrophone.show();
        this.el.btnSend.hide();
      }
    });
    this.el.btnSend.on("click", (e) => {
      Message.sendText(
        this._contactActive.chatId,
        this._user.email,
        this.el.inputText.innerHTML
      );

      this.el.inputText.innerHTML = "";
      this.el.panelEmojis.removeClass("open");
    });
    this.el.btnEmojis.on("click", (e) => {
      this.el.panelEmojis.toggleClass("open");
    });
    this.el.panelEmojis.querySelectorAll(".emojik").forEach((emoji) => {
      emoji.on("click", (e) => {
        // duplicando um elemento com cloneNode
        let img = this.el.imgEmojiDefault.cloneNode();
        // atribuindo os atributos do emoji para o img
        img.style.cssText = emoji.style.cssText;
        img.dataset.unicode = emoji.dataset.unicode;
        img.alt = emoji.dataset.unicode;
        // percorrendo e atribuindo classes
        emoji.classList.forEach((name) => img.classList.add(name));
        // recupera posição atual do cursor
        let cursor = window.getSelection();
        // verifica onde o cursor está e foca no texto se necessário
        if (cursor.focusNode || !cursor.focusNode.id == "input-text") {
          this.el.inputText.focus();
          cursor = window.getSelection();
        }
        // cria um elemento range
        let range = document.createRange();
        range = cursor.getRangeAt(0);
        range.deleteContents();
        // cria um elemento fragment
        let fragment = document.createDocumentFragment();
        fragment.appendChild(img);
        range.insertNode(fragment);
        range.setStartAfter(img);
        // forçar o keyup
        this.el.inputText.dispatchEvent(new Event("keyup"));
      });
    });
  }

  /** ---- fecha opções do microfone ---- */
  closeRecordMicrophone() {
    this.el.recordMicrophone.hide();
    this.el.btnSendMicrophone.show();
  }

  /** ---- fecha todos paineis principais ---- */
  closeAllMainPainel() {
    this.el.panelMessagesContainer.hide();
    this.el.panelDocumentPreview.removeClass("open");
    this.el.panelCamera.removeClass("open");
    this.el.pictureCamera.hide();
  }

  /** ---- fecha o menu attach ao clicar em qualquer outro elemento ---- */
  closeMenuAttach() {
    document.removeEventListener("click", this.closeMenuAttach);
    this.el.menuAttach.removeClass("open");
  }

  /** ---- oculta todos os paineis laterais ---- */
  closeAllPanelLeft() {
    this.el.panelEditProfile.hide();
    this.el.panelAddContact.hide();
  }
}
