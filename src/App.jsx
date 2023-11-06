import { useEffect, useState } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import reactLogo from "./assets/logo.png";

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
    window.location.reload();
  };

  async function createPdf(file) {
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const pdfBytes = event.target.result;

        // Base64-encoded header image
        const headerImageBase64 =
          "data:image/png;base64,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";

        const pdfDoc = await PDFDocument.load(pdfBytes);
        const headerImage = await pdfDoc.embedPng(headerImageBase64);

        // Add header and footer to all pages
        const [timesRomanFont, firstPage] = await Promise.all([
          pdfDoc.embedFont(StandardFonts.TimesRoman),
          pdfDoc.getPages(),
        ]);

        const fontSize = 12;
       

        for (const page of pdfDoc.getPages()) {
          //  const { width } = page.getSize(); // Get the page width
          //  const elementWidth = 100; // Width of the header image

          //  const x = (width - elementWidth) / 2;
          // Add the header to each page
          page.drawImage(headerImage, {
            x:210,
            y: page.getSize().height - 80,
            width: 150,
            height: 100,
          });

          // Add the footer to each page
          page.drawText(
            "WhatsApp: +91 9654388797              www.upskillclasses.com",
            {
              x:150,
              y: 30,
              size: fontSize,
              font: timesRomanFont,
              color: rgb(0, 0, 0),
            }
          );
        }

        // Serialize the modified PDF
        const modifiedPDFBytes = await pdfDoc.save();

        downloadPDF(modifiedPDFBytes, "ModifiedPDF");
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
        <input type="file" accept=".pdf" onChange={handleFileChange}/>
        <button onClick={handleUpload} className="bg-red-300 w-fit p-2 text-xl font-semibold rounded-lg text-white">Upload and Process</button>
      </div>
    </>
  );
}

export default App;
