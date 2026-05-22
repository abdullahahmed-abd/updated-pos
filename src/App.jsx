import Product from "./all component/Product"
import Category from "./all component/Category"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Addcart from "./all component/Addcart"
import Variant from "./all component/Variant"
import Signup from "./all component/Signup"
import Login from "./all component/Login"
// import Protected from "./all component/Protected"
import Inventory from "./all component/Inventory"
import Customer from "./all component/Customer"
import Discount from "./all component/Discount"
import Order from "./all component/Order"
import Additems from "./all component/Additems"
import Singleproduct from "./all component/Singlepage"


function App() {

  return (
    <>
           
             <BrowserRouter>
             
           <Routes>
            <Route  path="/" element={<Product/>}/>
            <Route  path="/category/" element={<Category/>}/>
            <Route  path="/addcart/" element={<Addcart/>}/>
            <Route  path="/variant/" element={<Variant/>}/>
            <Route  path="/customer/" element={<Customer/>}/>
            <Route  path="/discount/" element={<Discount/>}/>
            <Route path="/inventory/" element={<Inventory/>}/>
            <Route  path="/signup/" element={<Signup/>}/>
            <Route  path="/login/" element={<Login/>}/>
            <Route path="/order/"  element={<Order/>}/>
            <Route path="/Additems/"  element={<Additems/>}/>
            <Route path="/pr/:id"  element={<Singleproduct/>}/>
           
              

           </Routes>
           </BrowserRouter>
    </>
  )
}

export default App


