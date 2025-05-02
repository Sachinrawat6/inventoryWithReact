import React, { useState } from "react";
import { jsPDF } from "jspdf";
import JsBarcode from "jsbarcode";
import html2canvas from "html2canvas";
import { FaBarcode, FaTag } from "react-icons/fa";

const LabelGenerator = () => {
  const [products, setProducts] = useState([]);
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
  
      // Detect delimiter (comma or tab)
      const delimiter = content.includes("\t") ? "\t" : ",";
      const lines = content.trim().split("\n");
      const headers = lines[0].split(delimiter);
  
      if (headers.length < 10) {
        alert("CSV format seems invalid. Please check your columns.");
        return;
      }
  
      const data = lines.slice(1).map((line) => {
        const fields = line.split(delimiter);
        return {
          labelType: fields[0]?.trim(),
          sku: fields[1]?.trim(),
          name: fields[2]?.trim(),
          brand: fields[3]?.trim(),
          color: fields[4]?.trim(),
          size: fields[5]?.trim(),
          unit: fields[6]?.trim(),
          mrp: fields[7]?.trim(),
          quantity: parseInt(fields[8]) || 1,
          customText: fields[9]?.trim() || "",
        };
      });
  
      setProducts(data.filter(p => p.sku));
    };
    reader.readAsText(file);
  };
  

  const exportToPDF = async () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [100, 50],
    });

    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    for (const product of products) {
      for (let i = 0; i < product.quantity; i++) {
        const label = document.createElement("div");
        label.style.width = "100mm";
        label.style.height = "50mm";
        label.style.display = "flex";
        label.style.flexDirection = "column";
        label.style.justifyContent = "space-between";
        label.style.alignItems = "center";
        label.style.fontFamily = "Arial";
        label.style.fontSize = "10px";
        label.style.padding = "4mm";
        label.style.backgroundColor = "white";
        label.style.boxSizing = "border-box";

        const topText = document.createElement("div");
        topText.innerHTML = `
          <div><strong>${product.name}</strong></div>
          <div>Brand: ${product.brand}</div>
          <div>Color: ${product.color} | Size: ${product.size}</div>
          <div>MRP: ₹${product.mrp} | Unit: ${product.unit}</div>
          <div>SKU: ${product.sku}</div>

        `;
        topText.style.textAlign = "center";

        const canvas = document.createElement("canvas");
        JsBarcode(canvas, product.sku, {
          format: "CODE128",
          width: 2,
          height: 30,
          displayValue: false,
        });

        const bottomText = document.createElement("div");
        bottomText.innerText = product.customText;
        bottomText.style.fontSize = "8px";
        bottomText.style.textAlign = "center";
        bottomText.style.marginTop = "2mm";

        label.appendChild(topText);
        label.appendChild(canvas);
        label.appendChild(bottomText);
        container.appendChild(label);

        const canvasImage = await html2canvas(label, { scale: 3 });
        const imgData = canvasImage.toDataURL("image/png");

        if (!(product === products[0] && i === 0)) {
          pdf.addPage([100, 50], "landscape");
        }

        pdf.addImage(imgData, "PNG", 0, 0, 100, 50);
        container.removeChild(label);
      }
    }

    document.body.removeChild(container);
    pdf.save("labels.pdf");
  };

  return (
   <div className="container mx-auto p-6 max-w-4xl">
         <h1 className="text-2xl font-bold mb-6 flex gap-2 items-center">
           <span className="text-blue-400">
             <FaTag />
           </span>
           Label Generator
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
           
         </div>
      {products.length > 0 && (
        <button
          onClick={exportToPDF}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Download Labels
        </button>
      )}
    </div>
  );
};

export default LabelGenerator;
