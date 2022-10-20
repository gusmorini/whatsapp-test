import Pdfjs from "../util/PdfJs";

export default class DocumentPreviewController {
  constructor(file) {
    this._file = file;
    this._ext = file.name.split(".")[1];
  }

  getPreviewData() {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      switch (this._ext) {
        case "png":
        case "jpeg":
        case "jpg":
        case "gif":
          reader.onload = (e) =>
            resolve({
              src: reader.result,
              name: this._file.name,
              ext: this._ext,
              preview: true,
            });
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(this._file);
          break;

        case "pdf":
          const pdf = new Pdfjs();
          pdf.viewFile(this._file).then(({ url, numPages }) => {
            resolve({
              src: url,
              name: `${numPages} Página${numPages > 1 ? "s" : ""}`,
              preview: true,
            });
          });
          break;

        default:
          resolve({
            src: null,
            name: this._file.name,
            ext: this._ext,
          });
      }
    });
  }
}
