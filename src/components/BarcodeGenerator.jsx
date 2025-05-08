import React, { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import html2canvas from "html2canvas";
import { FaBarcode } from "react-icons/fa";

// Utility to format label info
const formatProductInfo = (product) => {
  return `
    <div>
      <strong>${product.name.split(" ")[0]}  ${product.sku}</strong><br/>
      ${product.name}
    </div>
  `;
};

const BarcodeGenerator = () => {
  const [products, setProducts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const previewRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      parseCSV(event.target.result);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv) => {
    const lines = csv.split("\n");
    const parsedProducts = lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const columns = line.split(",");
        if (columns.length < 4) return null;

        return {
          sku: columns[0]?.trim(),
          name: columns[1]?.trim(),
          rackSpace: columns[2]?.trim(),
          quantity: parseInt(columns[3]) || 1, // Ensure it's a number
        };
      })
      .filter((p) => p && p.sku);

    setProducts(parsedProducts);
    setPreviewUrl("");
  };



// Export all barcodes to single PDF with each on separate page
const exportToPDF = async () => {
  if (products.length === 0) return;

  try {
    setIsGenerating(true);
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [100, 50],
    });

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    document.body.appendChild(tempContainer);

    for (const product of products) {
      for (let i = 0; i < parseInt(product.quantity); i++) {
        const barcodeDiv = document.createElement("div");
        barcodeDiv.style.width = "100mm";
        barcodeDiv.style.height = "50mm";
        barcodeDiv.style.padding = "5mm";
        barcodeDiv.style.margin = "0";
        barcodeDiv.style.boxSizing = "border-box";
        barcodeDiv.style.display = "flex";
        barcodeDiv.style.flexDirection = "column";
    
        
        barcodeDiv.style.background = "white";

        const canvas = document.createElement("canvas");
        JsBarcode(canvas, product.sku, {
          format: "CODE128",
          width: 2,
          height: 40,
          displayValue: false,
          margin: 0,
        });

        const label = document.createElement("div");
        label.innerHTML = `<b> (${product.rackSpace}) ${product.sku} </b>`;
        label.style.marginTop = "4mm";
        label.style.fontFamily = "Helvetica, Arial, sans-serif";
        label.style.fontSize = "22px";
        label.style.font = "bold";
        label.style.textAlign = "center";
        label.style.lineHeight = "1.4";

        barcodeDiv.appendChild(canvas);
        barcodeDiv.appendChild(label);
        tempContainer.appendChild(barcodeDiv);

        const canvasImage = await html2canvas(barcodeDiv, {
          scale: 1,
          useCORS: true,
          backgroundColor: "#ffffff",
        });

        const imgData = canvasImage.toDataURL("image/png");

        if (!(product === products[0] && i === 0)) {
          pdf.addPage([100, 50], "landscape");
        }

        pdf.addImage(imgData, "PNG", 0, 0, 100, 50);
        tempContainer.removeChild(barcodeDiv);
      }
    }

    document.body.removeChild(tempContainer);
    pdf.save(`barcodes_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error("PDF export failed:", error);
    alert("Error exporting PDF!");
  } finally {
    setIsGenerating(false);
  }
};

// Generate preview of first barcode
const generatePreview = async () => {
  if (products.length === 0) {
    alert("No products to generate barcodes for!");
    return;
  }

  setIsGenerating(true);

  try {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    document.body.appendChild(tempDiv);

    const product = products[0];

    const barcodeDiv = document.createElement("div");
    barcodeDiv.style.width = "100mm";
    barcodeDiv.style.height = "50mm";
    barcodeDiv.style.padding = "0";
    barcodeDiv.style.margin = "0";
    barcodeDiv.style.boxSizing = "border-box";
    barcodeDiv.style.display = "flex";
    barcodeDiv.style.flexDirection = "column";
    barcodeDiv.style.justifyContent = "center";
    barcodeDiv.style.alignItems = "center";
    barcodeDiv.style.background = "white";

    const canvas = document.createElement("canvas");
    JsBarcode(canvas, product.sku, {
      format: "CODE128",
      width: 2,
      height: 40,
      displayValue: false,
      margin: 0,
    });

    const label = document.createElement("div");
    label.innerHTML = `<b> (${product.rackSpace}) ${product.sku} </b> <br> ${product.name}`;
    label.style.marginTop = "4mm";
    label.style.fontFamily = "Helvetica, Arial, sans-serif";
    label.style.fontSize = "12px";
    label.style.textAlign = "center";
    label.style.lineHeight = "1.4";

    barcodeDiv.appendChild(canvas);
    barcodeDiv.appendChild(label);
    tempDiv.appendChild(barcodeDiv);

    const previewCanvas = await html2canvas(barcodeDiv, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const dataUrl = previewCanvas.toDataURL("image/png");
    setPreviewUrl(dataUrl);

    document.body.removeChild(tempDiv);
  } catch (error) {
    console.error("Preview generation failed:", error);
    alert("Error generating preview! Check console for details.");
  } finally {
    setIsGenerating(false);
  }
};




  
  useEffect(() => {
    return () => {
      if (previewRef.current) {
        document.body.removeChild(previewRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 flex gap-2 items-center">
        <span className="text-blue-400">
          <FaBarcode />
        </span>
        Barcode Generator
      </h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block mb-2 font-medium">
          Upload CSV File:
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full mt-1 p-2 border border-gray-200 cursor-pointer hover:bg-blue-50 rounded bg-white"
          />
        </label>
        <p className="text-sm text-gray-500 mt-1">
          Format: SKU, Product Name, Label Type, Quantity
        </p>
      </div>

      {products.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between mb-3 items-center">
            <h2 className="text-xl font-semibold">
              Loaded Products (
              {products.reduce((acc, p) => acc + p.quantity, 0)} labels)
            </h2>
            <div className="flex gap-2">
              <button
                onClick={generatePreview}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isGenerating ? "Generating..." : "Preview Sample"}
              </button>
              <button
                onClick={exportToPDF}
                disabled={isGenerating}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                {isGenerating ? "Downloading..." : "Download Barcodes"}
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Labels</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3">{product.sku}</td>
                    <td className="p-3">{product.name}</td>
                    <td className="p-3">{product.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">
            Barcode Sample Preview (100mm × 50mm)
          </h2>
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Barcode preview"
                className="border border-gray-200"
                style={{ width: "100mm", height: "50mm" }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              All barcodes will be in a single PDF, one per 100×50mm page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeGenerator;
