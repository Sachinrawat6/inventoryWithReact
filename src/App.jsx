import React from 'react';
import { ProductContextProvider } from './components/context/ProductContext';
import Product from './components/Product';
import Navbar from './components/Navbar';
import BarcodeGenerator from './components/BarcodeGenerator';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LabelGenerator from './components/LabelGenerator';

const App = () => {
  return (
    <ProductContextProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden">
          {/* Fixed Navbar on the left */}
          <div className="fixed left-0 top-0 bottom-0 z-10">
            <Navbar />
          </div>
          
          {/* Scrollable content area */}
          <div className="flex-1 ml-64 pl-6 pr-6 overflow-y-auto">
            <Routes>
              <Route path='/' element={<Product/>} />
              <Route path='/barcode-generation' element={<BarcodeGenerator/>} />
              <Route path='/label-generation' element={<LabelGenerator/>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ProductContextProvider>
  );
};

export default App;