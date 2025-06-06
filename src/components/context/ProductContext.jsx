import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ProductContext = createContext();

const ProductContextProvider = ({ children }) => {
  const [productsData, setProductsData] = useState([]); // Example state
  
  const BASE_URL = "https://fastapi.qurvii.com";


const fetchProducts = async()=>{
    const response = await fetch("https://inventorybackend-m1z8.onrender.com/api/product");
    const result = await response.json();
    setProductsData(result);
}

// get data from orders 
 const getResponseFromOrders = async (orderId) => {
    const response = await axios.post(`${BASE_URL}/scan`, {
      user_id:  715,
      order_id: parseInt(orderId),
      user_location_id: 140,
    });
    const data = response.data.data;
    return data
  };



useEffect(()=>{
    fetchProducts();
},[])

  return (
    <ProductContext.Provider value={{ productsData ,getResponseFromOrders }}>
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