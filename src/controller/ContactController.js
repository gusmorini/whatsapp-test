import { ClassEvent } from "../util/ClassEvent";

import ContactItem from "../components/Contacts/ContactItem";

export default class ContactController extends ClassEvent {
  constructor(modal, user) {
    super();
    this._modal = modal;
    this._user = user;
    this._listEl = document.querySelector("#contact-list");
  }

  open() {
    this._user.getContacts().then((contacts) => {
      contacts.forEach((contact) => {
        const data = contact.data();
        let div = document.createElement("div");
        div.innerHTML = ContactItem;

        div.querySelector(".contact-name").innerHTML = data.name;

        if (data.photo) {
          let photo = div.querySelector(".contact-photo");
          photo.src = data.photo;
          photo.show();
        }

        div.on("click", () => this.selectItem(data));

        this._listEl.appendChild(div);
      });
    });

    this._modal.show();
  }

  close() {
    this._modal.hide();
  }

  selectItem(contact) {
    this.trigger("select", contact);
    this.close();
  }
}
