import React,{useState , useEffect} from 'react'
import {useAuth} from './context/AuthContext'


export default function DashboardNavbar() {

    const [users,setUser] = useState("")
    const {currentUser} = useAuth();

   

    const onSearchAccountClick=()=>{
        var elm = document.getElementById("searchAccounts")
        elm.style.display="block";
        elm = document.getElementById("")
    }

    const onSearchAccountBlur=()=>{
        var elm = document.getElementById("searchAccounts")
        elm.style.display="none";
    }
    useEffect(()=>{
      
        let name = currentUser.email;
        name = name.substring(0,name.length-10)
        setUser(name)
        
        console.log(currentUser)
    },[])
    return (
        <div className="relative">
            <div className="bg-gray-100 flex justify-between" style={{height:"10vh"}}>
                <h1 className="p-8"> CHAT APP</h1>
                <input onClick={onSearchAccountClick} onBlur={onSearchAccountBlur} className="p-8 rounded-3xl m-4 outline-none" style={{width:"35vw"}} placeholder="SEARCH"></input>
                <div>
                    <h3 className="p-8 border-2 rounded-3xl ">{users}</h3>
                </div>
            </div>
            <div onClick={onSearchAccountClick} id="searchAccounts" className="bg-gray-200 z-50 absolute hidden" style={{width:"40vw" , height:"40vh",top:"0" ,marginTop:"10vh",marginLeft:"30vw"}}>
 
 </div>
        </div>
    )
}
