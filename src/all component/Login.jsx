import axios from 'axios'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from './Contextapi'
import { useContext } from 'react'

const Login = () => {

const [username,setusername]=useState("")
const [email,setemail]=useState("")
const [password,setpassword]=useState("")

const data=useContext(AppContext) 

let [token,settoken,count,setcount,user,setuser]=data


const navigate=useNavigate()

const handleSubmit=(e)=>{

e.preventDefault()

const payload={
  user: username,
  emal: email,
  pswd: password
}
console.log(payload)



fetch("https://28n37gwj-8000.inc1.devtunnels.ms/jwt_login_user/", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(payload),
}).then((data)=>{
return data.json()  
}).then((res)=>{
navigate("/")     // isse direct dusre page pe render ho jate he
console.log(res)
localStorage.setItem("token",JSON.stringify(res.access))
setcount(count+1)
localStorage.setItem("user",JSON.stringify(payload.user))
}).catch((err)=>{
console.log('login failed',err)
})

}





  return (
    <>
<section className="bg-gray-50 h-[100vh] w-[100vw] dark:bg-gray-900 flex justify-center items-center fixed">
  <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">

      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Login here
              </h1>
              <form className="space-y-4 md:space-y-6 flex flex-col gap-2" action="#">
                  <div>
                      <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                      <input value={username} onChange={(e)=>{setusername(e.target.value)}} type="text" name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="username" required=""/>
                  </div>
                  <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                      <input value={email} onChange={(e)=>{setemail(e.target.value)}} type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="email" required=""/>
                  </div>
                  <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                      <input value={password} onChange={(e)=>{setpassword(e.target.value)}} type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required=""/>
                  </div>
                  <button onClick={(e)=>{handleSubmit(e)}} type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer">Login</button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                      Create a new account? <Link to="/signup" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Signup</Link>
                  </p>
              </form>
          </div>
      </div>
  </div>
</section>
    </>
  )
}

export default Login
