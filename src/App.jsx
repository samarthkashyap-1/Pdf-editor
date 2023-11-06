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
         

           
          // Add the header to each page
          page.drawImage(headerImage, {
            x:410,
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
        <input type="file" accept=".pdf" onChange={handleFileChange}/>
        <button onClick={handleUpload} className="bg-red-300 w-fit p-2 text-xl font-semibold rounded-lg text-white">Upload and Process</button>
      </div>
    </>
  );
}

export default App;
