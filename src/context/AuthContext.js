import React, { useContext, useState, useEffect } from "react"
import { auth } from "../firebase"
import firebase from '../firebase'

const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [loading, setLoading] = useState(true)

  function signup(email, password) {
    return auth.createUserWithEmailAndPassword(email, password)
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
  }

  function logout() {
   console.log(isSignedIn())
    return auth.signOut()
  }
  function user(){
    return auth.currentUser()
  }
   function isSignedIn(){
     auth.onAuthStateChanged((user)=>{
      if(user){
        return true;
      }
    })
    return false;
  }
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    login,
    signup,
    logout,
    user,
    isSignedIn
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
