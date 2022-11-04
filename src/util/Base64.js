export default class Base64 {
  static getMimeType(urlBase64) {
    const regex = /^data:(.+);base64,(.*)$/;
    const result = urlBase64.match(regex);
    return result[1];
  }

  static toFile(urlBase64) {
    const mimeType = Base64.getMimeType(urlBase64);
    const ext = mimeType.split("/")[1];
    const filename = `file${Date.now()}.${ext}`;
    return fetch(urlBase64)
      .then((res) => res.arrayBuffer())
      .then((buffer) => new File([buffer], filename, { type: mimeType }));
  }
}
