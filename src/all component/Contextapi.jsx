import React, { useEffect, useState } from "react"


const AppContext = React.createContext()



const AppProvider = (props) => {

  const [token, settoken] = useState(localStorage.getItem("token"))
  const [count, setcount] = useState(0)
  const [user, setuser] = useState(localStorage.getItem("user"))

  const [productdata, setproductdata] = useState([]);
  const [categorydata, setcategorydata] = useState([]);
  const [variantdata, setvariantdata] = useState([]);
  const [inventorydata, setInventorydata] = useState([]);
  const [productName, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [updateActive, setUpdateActive] = useState(false);
  const [variantName, setvariantName] = useState("");
  const [variantValue, setvariantValue] = useState("");
  const [variantprice, setvariantprice] = useState("");
  const [inventoryquantity, setinventoryquantity] = useState("");
  const [inventorylocation, setinventorylocation] = useState("");
  const [variantsarray, setvariantsarray] = useState([]);
  const [productvariants, setproductvariants] = useState([]);
  const [productId, setproductId] = useState("");

  const BaseUrl ="https://rihanna-kindliest-pseudoreligiously.ngrok-free.dev"

  useEffect(() => {
    settoken(localStorage.getItem("token"))
    console.log(token, 'muneeburrehman')
    setuser(localStorage.getItem("user"))
  }, [count])

  localStorage.setItem("token", JSON.stringify(""))





  return (
    <AppContext.Provider value={[token, settoken, count, setcount, user, setuser, categorydata, setcategorydata, productName, setName, sku, setSku, categoryId, setCategoryId, description, setDescription, updateActive, setUpdateActive, variantName, setvariantName, variantValue, setvariantValue, variantprice, setvariantprice, inventoryquantity, setinventoryquantity, inventorylocation, setinventorylocation, variantsarray, setvariantsarray, productvariants, setproductvariants, productId, setproductId,BaseUrl]}>{props.children}</AppContext.Provider>
  )


}




export { AppProvider, AppContext }
