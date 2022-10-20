import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import woker from "pdfjs-dist/build/pdf.worker.entry";

export default class PdfController {
  GlobalWorkerOptions = woker;

  constructor() {}

  viewFile(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        getDocument(new Uint8Array(reader.result))
          .promise.then((doc) => {
            const { numPages } = doc;
            doc.getPage(1).then((page) => {
              const viewport = page.getViewport({ scale: 1 });
              let canvas = document.createElement("canvas");
              let canvasContext = canvas.getContext("2d");
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              page
                .render({ canvasContext, viewport })
                .promise.then(() =>
                  resolve({
                    url: canvas.toDataURL("image/png"),
                    numPages,
                  })
                )
                .catch((err) => reject(err));
            });
          })
          .catch((err) => reject(err));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
