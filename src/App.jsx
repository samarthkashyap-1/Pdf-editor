import { useEffect, useState,useRef } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { ImageBase64 } from "./img.js";

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    setSelectedFiles(Array.from(files));
    
  };

  
  const handleUpload = () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one PDF file.");
      return;
    }
    
    selectedFiles.forEach((file) => {
    createPdf(file);
      
    });

    // Clear selected files
    setSelectedFiles([]);

     if (fileInputRef.current) {
       fileInputRef.current.value = "";
     }
  };

  

  async function createPdf(file) {
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const pdfBytes = event.target.result;

        // Base64-encoded header image
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const headerImage = await pdfDoc.embedPng(ImageBase64);
        const watermarkImage = await pdfDoc.embedPng(ImageBase64);

        // Add header and footer to all pages
        const [timesRomanFont] = await Promise.all([
          pdfDoc.embedFont(StandardFonts.TimesRoman),
        ]);

        for (const page of pdfDoc.getPages()) {
          // Add the header to each page
          page.drawImage(headerImage, {
            x: 485,
            y: page.getSize().height - 75,
            width: 100,
            height: 100,
            opacity: 0.8,
          });

          // Add the footer to each page
          page.drawText(
            "WhatsApp: +91 9654388797              www.upskillclasses.com",
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
            x: width / 2 - watermarkDimensions.width / 2,
            y: height / 2 - watermarkDimensions.height / 2,
            width: watermarkDimensions.width,
            height: watermarkDimensions.height,
            color: rgb(1, 1, 1),
            opacity: 0.3,
          });
        });

        // Serialize the modified PDF
        const modifiedPDFBytes = await pdfDoc.save();

        downloadPDF(modifiedPDFBytes, `${file.name}`);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing PDF:", error);
    }
  }

  // ... (previous code)

  function downloadPDF(pdfBytes, originalFileName) {
    const fileNameWithoutExtension = originalFileName.replace(/\.[^/.]+$/, ""); // Remove the file extension
    const newFileName = `${fileNameWithoutExtension}-Upskill-Format.pdf`;

    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = newFileName;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  }

  // ... (remaining code)



  return (
    <>
      <div className="flex flex-col items-center gap-10 mt-52">
        <h2 className="text-3xl text-center font-bold">Upload PDFs</h2>
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
        <button
          onClick={handleUpload}
          className="bg-red-300 w-fit p-2 text-xl font-semibold rounded-lg text-white"
        >
          Upload and Process
        </button>
      </div>
    </>
  );
}

export default App;
