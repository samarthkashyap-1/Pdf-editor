import { useEffect, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { ImageBase64 } from "./img.js";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a PDF file.");
      return;
    }
    createPdf(selectedFile);
    setSelectedFile(null)
  };

  async function createPdf(file) {
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const pdfBytes = event.target.result;

        // Base64-encoded header image
        
          
          // const existingPdfBytes = await inputFile.arrayBuffer();
          
          const pdfDoc = await PDFDocument.load(pdfBytes);
          const headerImage = await pdfDoc.embedPng(ImageBase64);
          const watermarkImage = await pdfDoc.embedPng(
            ImageBase64
          );

        // Add header and footer to all pages
        const [timesRomanFont, firstPage] = await Promise.all([
          pdfDoc.embedFont(StandardFonts.TimesRoman),
          pdfDoc.getPages(),
        ]);

        const fontSize = 12;
       

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
              x:150,
              y: 15,
              size: fontSize,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            }
          );
        }
        const pages = pdfDoc.getPages();
        pages.forEach((page) => {
          const { width, height } = page.getSize();
          const watermarkDimensions = watermarkImage.scale(0.5); // Adjust the scale as needed
          page.drawImage(watermarkImage, {
            x: width / 2 - watermarkDimensions.width / 2,
            y: height / 2 - watermarkDimensions.height / 2,
            width: watermarkDimensions.width,
            height: watermarkDimensions.height,
            color: rgb(1, 1, 1),
            opacity: 0.3, // Adjust the color as needed
          });
        });

        // Serialize the modified PDF
        const modifiedPDFBytes = await pdfDoc.save();

        downloadPDF(modifiedPDFBytes, "Upskill-Classes");
      };

      reader.readAsArrayBuffer(file);
      
    } catch (error) {
      console.error("Error processing PDF:", error);
    }
  }

  function downloadPDF(pdfBytes, fileName) {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    // No need to call createPdf here
  }, []);

  return (
    <>
      <div className="flex flex-col items-center gap-10 mt-52">
        <h2 className="text-3xl text-center font-bold">Upload a PDF</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          value={selectedFile ? selectedFile.fileName : ""}
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
