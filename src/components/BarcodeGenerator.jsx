import React, { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import html2canvas from "html2canvas";
import { FaBarcode } from "react-icons/fa";



const BarcodeGenerator = () => {
  const [products, setProducts] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const previewRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => parseCSV(event.target.result);
    reader.readAsText(file);
  };

  const parseCSV = (csv) => {
    const lines = csv.split("\n");
    const parsed = lines
      .slice(1)
      .filter(line => line.trim())
      .map(line => {
        const cols = line.split(",");
        if (cols.length < 4) return null;
        return {
          sku: cols[0]?.trim(),
          color: cols[2]?.trim(),
          rackSpace: cols[1]?.trim(),
          quantity: parseInt(cols[3]) || 1,
        };
      })
      .filter(p => p && p.sku);

    setProducts(parsed);
    setPreviewUrl("");
  };

  const createBarcodeImage = async (product) => {
    // 100mm x 50mm at 300 DPI = 1181 x 591 px
    const widthPx = 1181;
    const heightPx = 591;
  
    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = heightPx;
  
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, widthPx, heightPx);
  
    // Create a new offscreen canvas for JsBarcode
    const barcodeCanvas = document.createElement("canvas");
    JsBarcode(barcodeCanvas, product.sku, {
      format: "CODE128",
      width: 6,
      height: 200,
      displayValue: false,
      margin: 0,
    });
  
    // Draw barcode in the center horizontally
    const barcodeX = (widthPx - barcodeCanvas.width) / 2;
    const barcodeY = 150;
    ctx.drawImage(barcodeCanvas, barcodeX, barcodeY);
  
    // Add text label at the bottom
    ctx.fillStyle = "black";
    ctx.font = "60px Arial";
    ctx.textAlign = "center";
    const label = `${product.rackSpace} ${product.sku.split("-")[0]}-${product.color}-${product.sku.split("-")[1]}`;
    ctx.fillText(label, widthPx / 2, heightPx - 150);
  
    return canvas.toDataURL("image/png");
  };
  
  const exportToPDF = async () => {
    if (products.length === 0) return;

    try {
      setIsGenerating(true);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [100, 50],
      });

      const cache = {};

      for (const product of products) {
        const key = `${product.sku}_${product.name}_${product.rackSpace}`;
        if (!cache[key]) {
          cache[key] = await createBarcodeImage(product);
        }

        for (let i = 0; i < product.quantity; i++) {
          if (!(product === products[0] && i === 0)) {
            pdf.addPage([100, 50], "landscape");
          }
          pdf.addImage(cache[key], "PNG", 0, 0, 100, 50);

          if (i % 20 === 0) {
            // Delay every 20 renders to allow UI breathing room
            await new Promise((res) => setTimeout(res, 10));
          }
        }
      }

      pdf.save(`barcodes_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("Export error:", err);
      alert("PDF export failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePreview = async () => {
    if (products.length === 0) return alert("No products to preview!");

    try {
      setIsGenerating(true);
      const img = await createBarcodeImage(products[0]);
      setPreviewUrl(img);
    } catch (err) {
      console.error("Preview error:", err);
      alert("Preview failed.");
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


  if(isGenerating){
    return <p className="text-center text-xl mt-60 animate-pulse"> Generating Barcode.... </p>
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 flex gap-2 items-center">
        <span className="text-blue-400"><FaBarcode /></span>
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
              Loaded Products ({products.reduce((sum, p) => sum + p.quantity, 0)} labels)
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
                {isGenerating ? "Processing..." : "Download Barcodes"}
              </button>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Color</th>
                  <th className="p-3 text-left">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-3">{product.sku}</td>
                    <td className="p-3">{product.color}</td>
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
          <h2 className="text-xl font-semibold mb-3">Barcode Preview (100mm × 50mm)</h2>
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-center">
              <img
                src={previewUrl}
                alt="Preview"
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
