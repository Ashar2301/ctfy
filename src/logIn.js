import {Link} from 'react-router-dom'
import {useState} from 'react'
import {useAuth} from './context/AuthContext'
import  StyledFirebaseAuth  from 'react-firebaseui/StyledFirebaseAuth'
import {auth} from './firebase'
import { useHistory } from 'react-router'
import firebase  from 'firebase'

const LogIn=()=>{
    const [error,setError] = useState("");
    const history = useHistory();
    const [loading,setLoading] = useState(false);
    const [isSignedIn , setSignIn] = useState(false);
    const {login,currentUser,logout} = useAuth();
    const uiConfig = {
        signInFlow: "popup",
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ],
        callbacks: {
          signInSuccess: () => {
              const db = firebase.firestore();
              console.log(auth.currentUser)
              db.collection("Users").doc(auth.currentUser.email).set({
                email : auth.currentUser.email,
                name: auth.currentUser.displayName,
                pfp:auth.currentUser.photoURL
            })
            .then((id)=>{
               // window.alert("Log In Successfull.")
                // window.location.replace("https://ctfy.netlify.app/dashboard")
                history.push('/dashboard');
                window.location.reload();
            })
            .catch((err)=>{
                console.log(err)
            })
          }
        }
      }

    const onLogInClick=()=>{
        let email = document.getElementById("email")
        let password = document.getElementById("password")

        if(email.value.length ===0 || password.value.length === 0){
            return setError("All Field Are Neccessary")
        }
            setError("")
            setLoading(true)
            login(email.value,password.value)
            .then(()=>{
               // window.alert("Log In Successfull.")
               history.push('/dashboard');
               window.location.reload();
            })
            .catch((error)=>{
                return setError("Failed To Log In" + error.message)
            })
            //logout()
        
        setLoading(false)
    }

    return(
        
            <section className="flex flex-col items-center justify-center "  >
             
                    <h1  className="font-medium text-4xl text-center" style={{marginTop:'5vh',marginBottom:'5vh'}}>Log In</h1>

                    
                    <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth}></StyledFirebaseAuth>
                    <h2 className='my-6 w-4/6 text-center mx-auto' style={{borderBottom:"1px solid black",lineHeight:'.1em',margin:'10px 0 20px',padding:'0 10px',backgroundColor:'#ecf0f1'}}><span className="bg-white p-2 mx-auto my-6" >OR</span></h2>

                    {error && <div class="alert flex flex-row items-center bg-red-200 p-5 rounded border-b-2 border-red-300 w-4/6">
                    <div class="alert-icon flex items-center bg-red-100 border-2 border-red-500 justify-center h-10 w-10 flex-shrink-0 rounded-full">
                        <span class="text-red-500">
                            <svg fill="currentColor"
                                viewBox="0 0 20 20"
                                class="h-6 w-6">
                                <path fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd"></path>
                            </svg>
                        </span>
                    </div>
                        <div class="alert-content ml-4">
                            <div class="alert-title font-semibold text-lg text-red-800">
                                Error
                            </div>
                            <div class="alert-description text-sm text-red-600">
                                {error}
                            </div>
                        </div>
                    </div>}


                    <input id="email" className="py-2 px-2 my-6  rounded-lg w-4/6 mx-auto" type="email" style={{backgroundColor:'#ecf0f1'}} placeholder="Enter Email"></input>
                    <input id="password" className="py-2 px-2 my-3 rounded-lg focus:border-transparent w-4/6 mx-auto" style={{backgroundColor:'#ecf0f1'}} type="password" placeholder="Enter Password"></input>
                    <button onClick={onLogInClick} disabled={loading} className="p-2 my-6 border-2 rounded-lg w-4/6 " style={{marginLeft:"auto",marginRight:"auto",backgroundColor:'#7ed6df'}}>LOG IN</button>
                    <div className="my-8">Don't Have An Account ?<span className="underline"><Link to="/signup"> Register</Link> </span></div>
                    
                    
                    
                
            </section>
        
    )


}

export default LogIn;