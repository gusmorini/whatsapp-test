/**
 * class PrototypeController
 * métodos aplicados diretamente no
 * prototype do elemento para
 * acelerar o desenvolvimento
 */
export default class PrototypesController {
  static elementsPrototype() {
    /** oculta o elemento */
    Element.prototype.hide = function () {
      this.style.display = "none";
      return this;
    };
    /** mostra o elemento */
    Element.prototype.show = function () {
      this.style.display = "block";
      return this;
    };
    /** faz um toogle entre o hide e o show */
    Element.prototype.toggle = function () {
      this.style.display = this.style.display === "none" ? "block" : "none";
      return this;
    };
    /** metodo de vários eventos
     * recebe os eventos separados por ","
     * ex: this.on('click, dblclick', fn)
     */
    Element.prototype.on = function (events, fn) {
      events.split(",").forEach((event) => {
        this.addEventListener(event, fn);
      });
      return this;
    };
    /** método manipular style css
     * ex: this.css({ background: 'red', width: '50% })
     */
    Element.prototype.css = function (styles) {
      for (const name in styles) {
        this.style[name] = styles[name];
      }
      return this;
    };
    /* méotodo adicionar class */
    Element.prototype.addClass = function (name) {
      this.classList.add(name);
      return this;
    };
    /** método remove class */
    Element.prototype.removeClass = function (name) {
      this.classList.remove(name);
      return this;
    };
    /** método toogle class */
    Element.prototype.toggleClass = function (name) {
      this.classList.toggle(name);
      return this;
    };
    /** método verifica se a classe existe no elemento */
    Element.prototype.hasClass = function (name) {
      return this.classList.contains(name);
    };
    /** retorna campos do form dentro do formData */
    HTMLFormElement.prototype.getForm = function () {
      return new FormData(this);
    };
    /** retorna os dados do form em JSON */
    HTMLFormElement.prototype.toJSON = function () {
      let json = {};
      this.getForm().forEach((value, key) => {
        json[key] = value;
      });
      return json;
    };
  }
}
