import React, { createContext, useContext, useEffect, useState } from "react";

const ProductContext = createContext();

const ProductContextProvider = ({ children }) => {
  const [productsData, setProductsData] = useState([]); // Example state


const fetchProducts = async()=>{
    const response = await fetch("https://inventorybackend-m1z8.onrender.com/api/product");
    const result = await response.json();
    setProductsData(result);
}

useEffect(()=>{
    fetchProducts();
},[])

 

  return (
    <ProductContext.Provider value={{ productsData }}>
      {children}
    </ProductContext.Provider>
  );
};






const useGlobalContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a ProductContextProvider");
  }
  return context;
};

export { ProductContextProvider, useGlobalContext };