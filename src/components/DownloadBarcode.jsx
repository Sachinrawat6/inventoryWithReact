// const downloadBarcodes = (data,googleSheetColors)=>{
    
//     try {
//         // 1. Get products from localStorage
//         const products = JSON.parse(localStorage.getItem("products")) || [];
        
        
//         if (products.length === 0) {
//           alert("No products found in inventory!");
//           return;
//         }
    
//         // 2. Prepare CSV header
//         const headers =  "OrderId,Barcode,Title,Label Type,Qty\n";
        
//         // 3. Process ALL products into CSV rows
//         const csvRows = products.map(product => {
//           // const matched = data?.find((p)=>p.style_code==product.styleNumber);
//           const matched = googleSheetColors?.find((p)=>p.stylenumber==product.styleNumber);
//           console.log("barcode colors",matched)
//           // Ensure all required fields exist with fallbacks
//           return [
//             `${product.orderId}`,
//             `${product.styleNumber}-${product.size}-${product.parentStyleNumber}`,
//             // `(${matched?.rack_space==="" || matched?.rack_space.toLowerCase()==="default"  ?product?.rackSpace:matched?.rack_space}) `,
//             product?.rackSpace,
//             `${matched?.styleprimarycolor}`,
//             product?.quantity
//           ].join(',');
//         });
    
//         // 4. Combine header and all rows
//         const csvContent = headers + csvRows.join("\n");
        
//         // 5. Create download
//         const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//         const link = document.createElement("a");
//         link.href = URL.createObjectURL(blob);
//         link.download = `BulkGenerateBarcodeLabels.csv`;
//         link.click();
        
//         // 6. Clean up
//         setTimeout(() => URL.revokeObjectURL(link.href), 100);
//       } catch (error) {
//         console.error("Download failed:", error);
//         alert("Failed to generate inventory file!");
//       }
// } 

const downloadBarcodes = (data, googleSheetColors) => {
  try {
    const products = JSON.parse(localStorage.getItem("products")) || [];

    if (!products.length) {
      alert("No products found in inventory!");
      return;
    }

    const headers = "OrderId,Barcode,Title,Label Type,Qty\n";

    /** STEP 1: Group by parentStyleNumber */
    const parentMap = {};

    products.forEach((product) => {
      if (!parentMap[product.parentStyleNumber]) {
        parentMap[product.parentStyleNumber] = [];
      }
      parentMap[product.parentStyleNumber].push(product);
    });

    const rows = [];

    /** STEP 2: Parent → Size logic */
    Object.entries(parentMap).forEach(([parentStyle, items]) => {
      const sizeMap = {};

      items.forEach((item) => {
        if (!sizeMap[item.size]) {
          sizeMap[item.size] = [];
        }
        sizeMap[item.size].push(item);
      });

      Object.entries(sizeMap).forEach(([size, sizeItems]) => {
        // 🔥 COLOR (same as your working logic)
        const matched = googleSheetColors?.find(
          (p) => p.stylenumber == sizeItems[0].styleNumber
        );

        const color = matched?.styleprimarycolor || "NA";

        /** ✅ COMBO CASE */
        if (sizeItems.length > 1) {
          rows.push([
            "-",
            `${parentStyle}-${size}`,
            sizeItems[0]?.rackSpace,
            color,
            sizeItems.reduce((sum, i) => sum + (i.quantity || 0), 0),
            
          ]);
        }
        /** ✅ SINGLE CHILD CASE */
        else {
          const item = sizeItems[0];
          rows.push([
            `${item.orderId}`,
            `${item.styleNumber}-${size}-${parentStyle}`,
            item?.rackSpace,
            color,
            item.quantity,
          ]);
        }
      });
    });

    /** STEP 3: CSV generate */
    const csvContent = headers + rows.map(r => r.join(",")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "BulkGenerateBarcodeLabels.csv";
    link.click();

    setTimeout(() => URL.revokeObjectURL(link.href), 100);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to generate inventory file!");
  }
};



export default downloadBarcodes;