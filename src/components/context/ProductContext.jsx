import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const ProductContext = createContext();

const ProductContextProvider = ({ children }) => {
  const [productsData, setProductsData] = useState([]);
  const [colors, setColors] = useState([]);
  
  const BASE_URL = "https://fastapi.qurvii.com";

// product fetching like mrp style_id etc 
const fetchProducts = async()=>{
    const response = await fetch("https://inventorybackend-m1z8.onrender.com/api/product");
    const result = await response.json();
    setProductsData(result);
}

// color fetching 
const fetchColors = async()=>{
  const response = await axios.get("https://inventorybackend-m1z8.onrender.com/api/v1/colors/get-colors")
  setColors(response.data.data);
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
    fetchColors();
},[])

  return (
    <ProductContext.Provider value={{ productsData ,getResponseFromOrders,colors }}>
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