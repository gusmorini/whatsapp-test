import Format from "../util/Format";
import PrototypesController from "./PrototypesController";
import CameraController from "./CameraController";
import MicrophoneController from "./MicrophoneController";
import DocumentPreviewController from "./DocumentPreviewController";

export default class MainController {
  constructor() {
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
      console.log(this.el.inputNamePanelEditProfile.innerHTML);
    });

    /** ---- form add contact ---- */
    this.el.formPanelAddContact.on("submit", (e) => {
      e.preventDefault();
      let data = this.el.formPanelAddContact.toJSON();
      console.log(data);
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
      [...e.target.files].forEach((file) => console.log(file));
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
      console.log(this.el.pictureCamera.src);
      this._camera.stop();
    });

    /** ---- item documento ---- */
    this.el.btnAttachDocument.on("click", () => {
      this.closeAllMainPainel();
      this.el.panelDocumentPreview.addClass("open");
      this.el.panelDocumentPreview.css({
        height: "calc(100%)",
      });
      this.el.inputDocument.click();
    });
    this.el.inputDocument.on("change", (e) => {
      if (this.el.inputDocument.files.length) {
        let file = this.el.inputDocument.files[0];
        this._document = new DocumentPreviewController(file);
        this._document
          .getPreviewData()
          .then(({ src, name, ext, preview }) => {
            if (preview) {
              this.el.imgPanelDocumentPreview.src = src;
              this.el.infoPanelDocumentPreview.innerHTML = name;
              this.el.imagePanelDocumentPreview.show();
              this.el.filePanelDocumentPreview.hide();
            } else {
              let classIcon = "";
              switch (ext) {
                case "doc":
                case "docx":
                  classIcon = "icon-doc-doc";
                  break;

                case "xls":
                case "xlxs":
                  classIcon = "icon-doc-xls";
                  break;

                case "ppt":
                case "pptx":
                  classIcon = "icon-doc-ppt";
                  break;

                case "txt":
                  classIcon = "icon-doc-txt";
                  break;

                default:
                  classIcon = "icon-doc-generic";
              }
              this.el.iconPanelDocumentPreview.classList = "jcxhw " + classIcon;
              this.el.filenamePanelDocumentPreview.innerHTML = name;
              this.el.imagePanelDocumentPreview.hide();
              this.el.filePanelDocumentPreview.show();
            }
          })
          .catch((err) => console.error(err));
      }
    });
    this.el.btnClosePanelDocumentPreview.on("click", (e) => {
      this.closeAllMainPainel();
      this.el.panelMessagesContainer.show();
    });
    this.el.btnSendDocument.on("click", (e) => {
      console.log("SEND DOCUMENT");
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
      const text = this.el.inputText.innerHTML;
      console.log(text);
      this.el.inputText.innerHTML = "";
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
