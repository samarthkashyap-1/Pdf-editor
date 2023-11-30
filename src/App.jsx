import React, { useEffect, useState, useRef } from "react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { ImageBase64 } from "./img.js";

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [footer, setFooter] = useState("WhatsApp: +91 9654388797");
  const [pdfGenerationInProgress, setPdfGenerationInProgress] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    setSelectedFiles(Array.from(files));
  };

  const handleRadioChange = (e) => {
    setFooter(e.target.value);
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one PDF file.");
      return;
    }

    setPdfGenerationInProgress(true);
  };

  useEffect(() => {
    if (pdfGenerationInProgress) {
      selectedFiles.forEach((file) => {
        createPdf(file, footer);
      });

      // Clear selected files
      setSelectedFiles([]);
      setPdfGenerationInProgress(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [pdfGenerationInProgress, selectedFiles, footer]);

  async function createPdf(file, selectedFooter) {
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const pdfBytes = event.target.result;
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const headerImage = await pdfDoc.embedPng(ImageBase64);
        const watermarkImage = await pdfDoc.embedPng(ImageBase64);

        const [timesRomanFont] = await Promise.all([
          pdfDoc.embedFont(StandardFonts.TimesRoman),
        ]);

        for (const page of pdfDoc.getPages()) {
          page.drawImage(headerImage, {
            x: 485,
            y: page.getSize().height - 60,
            width: 100,
            height: 50,
            opacity: 0.8,
          });

          page.drawText(
            `${selectedFooter}              www.upskillclasses.com`,
            {
              x: 150,
              y: 15,
              size: 12,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            }
          );
        }

        const pages = pdfDoc.getPages();
        pages.forEach((page) => {
          const { width, height } = page.getSize();
          const watermarkDimensions = watermarkImage.scale(0.5);

          page.drawImage(watermarkImage, {
            x: width / 3.5,
            y: height / 4,
            width: watermarkDimensions.width,
            height: watermarkDimensions.height,
            color: rgb(1, 1, 1),
            opacity: 0.1,
            rotate: degrees(40),
          });
        });

        const modifiedPDFBytes = await pdfDoc.save();
        downloadPDF(modifiedPDFBytes, `${file.name}`);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing PDF:", error);
    }
  }

  function downloadPDF(pdfBytes, originalFileName) {
    const fileNameWithoutExtension = originalFileName.replace(/\.[^/.]+$/, "");
    const newFileName = `${fileNameWithoutExtension}-Upskill-Format.pdf`;

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex flex-col items-center gap-10 mt-52">
        <h2 className="text-3xl text-center font-bold">Upload PDFs</h2>
        <form action="" className="flex flex-col gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            multiple
            defaultValue={
              selectedFiles.length > 0
                ? `${selectedFiles.length} files selected`
                : ""
            }
          />
          <div className="flex gap-2">
            <input
              type="radio"
              value="WhatsApp: +91 9654388797"
              id="whatsapp"
              name="selector"
              onChange={handleRadioChange}
              required
              defaultChecked
            />
            <label htmlFor="whatsapp">WhatsApp</label>
          </div>
          <div className="flex gap-2">
            <input
              type="radio"
              value="For Classroom only &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
              id="classroom"
              name="selector"
              onChange={handleRadioChange}
              required
            />
            <label htmlFor="classroom">For Classroom only</label>
          </div>
          <input
            type="submit"
            onClick={handleUpload}
            className={`bg-red-300 w-fit p-2 text-xl font-semibold rounded-lg text-white ${
              footer ? "" : "cursor-not-allowed opacity-50"
            }`}
            disabled={!footer}
            value=" Upload and Process"
          />
        </form>
      </div>
    </>
  );
}

export default App;
