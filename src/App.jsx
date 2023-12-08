import React, { useState } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

import { ImageBase64 } from "./img.js";

// Provide the correct path

const Pdfmodifier = () => {
  // const number = import.meta.env.VITE_REACT_APP_NUMBER;
  // console.log(number)
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [footerText, setFooterText] = useState(`WhatsApp: +91 9654388797`);
  const [resultPdf, setResultPdf] = useState(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    setSelectedPdf(Array.from(files));
  };
  const handleFooterTextChange = (event) => {
    setFooterText(event.target.value);
  };

  const addHeaderFooterToPdf = async () => {
    if (!selectedPdf) {
      alert("Please select a PDF file");
      return;
    }

    const modifiedPdfs = [];

    for (const file of selectedPdf) {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      const defaultHeaderImageEmbed = await pdfDoc.embedPng(ImageBase64);
      const watermarkImage = await pdfDoc.embedPng(ImageBase64);

      pages.forEach((page) => {
        const { width, height } = page.getSize();

        // Add default header image
        page.drawImage(defaultHeaderImageEmbed, {
          x: 475,
          y: page.getSize().height - 60,
          width: 100,
          height: 40,
          opacity: 0.8,
        });

        // Add footer text
        page.drawText(`${footerText}              www.upskillclasses.com`, {
          x: 150,
          y: 30,
          size: 12,
          color: rgb(0, 0, 0),
        });
      });

      pages.forEach((page) => {
        const { width, height } = page.getSize();
        const watermarkDimensions = watermarkImage.scale(0.5);

        page.drawImage(watermarkImage, {
          x: width / 3.5,
          y: height / 4,
          width: watermarkDimensions.width,
          height: watermarkDimensions.height,
          color: rgb(1, 1, 1),
          opacity: 0.3,
          rotate: degrees(40),
        });
      });

      const modifiedPdfBytes = await pdfDoc.save();
      modifiedPdfs.push(
        new Blob([modifiedPdfBytes], { type: "application/pdf" })
      );
    }

    setResultPdf(modifiedPdfs);
  };

  const downloadAllPdf = () => {
    if (resultPdf.length === 0) {
      alert("No modified PDFs to download");
      return;
    }

    resultPdf.forEach((pdf, index) => {
      const fileNameWithoutExtension = selectedPdf[index].name.replace(
        /\.[^/.]+$/,
        ""
      );
      const newFileName = `${fileNameWithoutExtension}-Upskill-Format.pdf`;
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(pdf);
      downloadLink.download = newFileName;
      downloadLink.click();
    });
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto my-8 p-4 bg-gray-100 rounded-md">
      <h2 className="text-2xl font-bold mb-4">Upskill Pdf Modifier</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Select PDF file:
        </label>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          className="mt-1 p-2 border rounded-md w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Footer Text:
        </label>
        <div className="flex items-center">
          <input
            type="radio"
            id="whatsapp"
            value={`WhatsApp: +91 9654388797`}
            checked={footerText === `WhatsApp: +91 9654388797`}
            onChange={handleFooterTextChange}
            className="mr-2"
          />
          <label htmlFor="whatsapp" className="mr-4">
            WhatsApp
          </label>

          <input
            type="radio"
            id="classroom"
            value="For classroom only"
            checked={footerText === "For classroom only"}
            onChange={handleFooterTextChange}
            className="mr-2"
          />
          <label htmlFor="classroom">For classroom only</label>
        </div>
      </div>

      <button
        onClick={() => {
          addHeaderFooterToPdf();
        }}
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        Upload PDF
      </button>
      {resultPdf && (
        <button
          onClick={() => {
            downloadAllPdf();
          }}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 ml-4"
        >
          Download PDF
        </button>
      )}
    </div>
  );
};

export default Pdfmodifier;
