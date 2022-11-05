import Pdfjs from "../util/PdfJs";

export default class DocumentPreviewController {
  constructor(file) {
    this._file = file;
    const split = file.name.split(".");
    this._ext = split[split.length - 1];
    this._data = {};
  }

  getPreviewData() {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      let icon = DocumentPreviewController.getIcon(this._ext);

      switch (this._ext) {
        case "png":
        case "jpeg":
        case "jpg":
        case "gif":
          reader.onload = (e) =>
            resolve({
              file: this._file,
              // src: reader.result,
              ext: this._ext,
              preview: reader.result,
              icon,
            });
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(this._file);
          break;

        case "pdf":
          const pdf = new Pdfjs();
          pdf.viewFile(this._file).then(({ url, numPages }) => {
            resolve({
              file: this._file,
              // src: url,
              pages: `${numPages} Página${numPages > 1 ? "s" : ""}`,
              ext: this._ext,
              preview: url,
              icon,
            });
          });
          break;

        default:
          resolve({
            file: this._file,
            ext: this._ext,
            icon,
          });
      }
    });
  }

  static getIcon(ext) {
    let classIcon = "";
    switch (ext) {
      case "pdf":
        classIcon = "icon-doc-pdf";
        break;

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
    return classIcon;
  }
}
