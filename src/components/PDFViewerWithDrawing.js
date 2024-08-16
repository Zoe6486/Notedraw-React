import React, { useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";
import "./PDFViewerWithDrawing.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

function PDFViewerWithDrawing({ pdfUrl, drawingEnabled, eraserEnabled }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then((pdf) => {
      for (let i = 1; i <= pdf.numPages; i++) {
        pdf.getPage(i).then((page) => {
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "pdf-canvas";
          containerRef.current.appendChild(canvas);
          const context = canvas.getContext("2d");

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          page.render(renderContext);
        });
      }
    });
  }, [pdfUrl]);

  useEffect(() => {
    if (drawingEnabled || eraserEnabled) {
      const canvases = containerRef.current.querySelectorAll("canvas");
      canvases.forEach((canvas) => {
        canvas.addEventListener("mousedown", startDrawing);
        canvas.addEventListener("mousemove", draw);
        canvas.addEventListener("mouseup", stopDrawing);
        canvas.addEventListener("mouseleave", stopDrawing);
      });
    }
  }, [drawingEnabled, eraserEnabled]);

  const startDrawing = (event) => {
    const canvas = event.target;
    canvas.className = "drawing-canvas";
    const context = canvas.getContext("2d");
    context.beginPath();
    context.moveTo(event.offsetX, event.offsetY);
    canvas.isDrawing = true;

    if (eraserEnabled) {
      context.globalCompositeOperation = "destination-out";
      context.lineWidth = 10;
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = "black";
      context.lineWidth = 2;
    }
  };

  const draw = (event) => {
    if (!event.target.isDrawing) return;
    const canvas = event.target;
    const context = canvas.getContext("2d");
    context.lineTo(event.offsetX, event.offsetY);
    context.stroke();
  };

  const stopDrawing = (event) => {
    const canvas = event.target;
    canvas.isDrawing = false;
  };

  return (
    <div className="pdf-viewer-container" ref={containerRef}>
      {/* 所有 PDF 页面和绘图功能都会在这里显示 */}
    </div>
  );
}

export default PDFViewerWithDrawing;
