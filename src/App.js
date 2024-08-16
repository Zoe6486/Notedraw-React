import React, { useState } from "react";
import PDFViewerWithDrawing from "./components/PDFViewerWithDrawing";
import "./App.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  const [eraserEnabled, setEraserEnabled] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  const handleEnableDrawing = () => {
    setDrawingEnabled(true);
    setEraserEnabled(false); // Disable eraser when drawing mode is enabled
  };

  const handleEnableEraser = () => {
    setEraserEnabled(true);
    setDrawingEnabled(false); // Disable drawing when eraser mode is enabled
  };

  const handleSaveToLocal = async () => {
    const canvases = document.querySelectorAll(".pdf-canvas");
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvases[0].width, canvases[0].height],
    });

    for (let i = 0; i < canvases.length; i++) {
      const canvas = canvases[i];
      const drawingCanvas = document.querySelectorAll(".drawing-canvas")[i];

      const combinedCanvas = await mergeCanvases(canvas, drawingCanvas);
      const imgData = combinedCanvas.toDataURL("image/png");

      doc.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      if (i < canvases.length - 1) {
        doc.addPage();
      }
    }

    doc.save("annotated.pdf");
  };

  const mergeCanvases = (baseCanvas, drawingCanvas) => {
    return new Promise((resolve) => {
      const combinedCanvas = document.createElement("canvas");
      combinedCanvas.width = baseCanvas.width;
      combinedCanvas.height = baseCanvas.height;
      const context = combinedCanvas.getContext("2d");

      context.drawImage(baseCanvas, 0, 0);
      if (drawingCanvas) {
        context.drawImage(drawingCanvas, 0, 0);
      }

      resolve(combinedCanvas);
    });
  };

  return (
    <div className="App">
      <h1>PDF Viewer with Drawing</h1>
      <div className="button-group">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="upload-button"
        />
        <label htmlFor="upload-button" className="button">
          Upload PDF
        </label>
        <button onClick={handleEnableDrawing} className="button">
          Enable Drawing
        </button>
        <button onClick={handleEnableEraser} className="button">
          Enable Eraser
        </button>
        <button onClick={handleSaveToLocal} className="button">
          Save to PDF
        </button>
      </div>

      {pdfFile && (
        <PDFViewerWithDrawing
          pdfUrl={pdfFile}
          drawingEnabled={drawingEnabled}
          eraserEnabled={eraserEnabled}
        />
      )}
    </div>
  );
}

export default App;
