const downloadBarcodes = (data)=>{
    
    try {
        // 1. Get products from localStorage
        const products = JSON.parse(localStorage.getItem("products")) || [];
        
        
        if (products.length === 0) {
          alert("No products found in inventory!");
          return;
        }
    
        // 2. Prepare CSV header
        const headers =  "Barcode,Title,RackSpace,Qty\n";
        
        // 3. Process ALL products into CSV rows
        const csvRows = products.map(product => {
          const matched = data?.find((p)=>p.style_code==product.styleNumber);
          
          // Ensure all required fields exist with fallbacks
          return [
            `${product.styleNumber}-${product.size}`,
            `${matched.style_name}`,
            `${product.rackSpace}`,
            product.quantity
          ].join(',');
        });
    
        // 4. Combine header and all rows
        const csvContent = headers + csvRows.join("\n");
        
        // 5. Create download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `BulkGenerateBarcodeLabels.csv`;
        link.click();
        
        // 6. Clean up
        setTimeout(() => URL.revokeObjectURL(link.href), 100);
      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to generate inventory file!");
      }
}

export default downloadBarcodes;