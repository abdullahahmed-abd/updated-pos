import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AppContext } from './Contextapi'


const Protected = () => {

const data=useContext(AppContext) 

let [token,settoken,count,setcount]=data

console.log(token,'sddddddddddd')

  return (

// token!=="undefined" && token!==null  ? <Outlet/> :  <Navigate to="login"/>     // iska matlab he agar token he to outlet pe bhejdo nahi to login pe bhejdo 
<Outlet/>

  )
}

export default Protected
