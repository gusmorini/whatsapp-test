export default class Format {
  /**
   * método transforma texto em camelcase
   * ex: meu-elemento -> meuElemento
   */
  static getElementCase(text) {
    let div = document.createElement("div");
    div.innerHTML = `<p data-${text}="banana"></p>`;
    return Object.keys(div.firstChild.dataset)[0];
  }

  /**
   * método formata milesegundos em
   * hora, minuto, segundo
   * ex: 1:00:00 ou 10:00
   */
  static toTime(duration) {
    const seconds = parseInt((duration / 1000) % 60);
    const minutes = parseInt((duration / (1000 * 60)) % 60);
    const hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
  }
}
