import {Link} from 'react-router-dom'
import {useState} from 'react'
import {useAuth} from './context/AuthContext'
import firebase from 'firebase/app';
import 'firebase/firestore';

const SignUp=()=>{
    const [error,setError] = useState("");
    const [loading,setLoading] = useState(false);
    const {signup,currentUser} = useAuth(true);
    const [email,setEmail] = useState(true);
    const [name,setName] = useState(true);
    const [password,setPassword] = useState(true);

    const onSignInClick=()=>{
        let emailRef = document.getElementById("email");
        let nameRef = document.getElementById("name");
        let passwordRef = document.getElementById("password");
        let cpasswordRef = document.getElementById("cpassword");
        if(passwordRef.value !== cpasswordRef.value){
            return setError("Passwords Do Not Match Error")
        }
        else if(emailRef.value.length === 0 ||nameRef.value.length === 0 ||passwordRef.value.length === 0 ||cpasswordRef.value.length === 0 ){
            console.log('here')
            return setError("All Fields Are Neccessary")
        }
        
            
            setError("");
            setLoading(true);

            signup(emailRef.value,passwordRef.value)
            .then(( )=>{
                const db = firebase.firestore();
            db.collection("Users").doc(emailRef.value).set({
                email : emailRef.value,
                name: nameRef.value,
                pfp : ""
            })
            .then((id)=>{
                console.log("User Added With ID = " + id)
                window.alert("Sign In Successfull . Redirecting To Log In Page")
                window.location.replace("https://ctfy.netlify.app/")
            })
            .catch((err)=>{
                console.log(err)
            })
            })
            .catch((error)=>{
                return setError("Failed To Create Account. " + error.message)
            })
           

               
           
            
            setLoading(false);  
    }
   const onNameChange=(event)=>{
        if(event.target.value.length <1)
        {
            setName(true);
           return setError('Enter Your Name')
        }
        else{
            setName(false)
            setError('')
        }
    }
    const onEmailChange=(event)=>{
        const value = event.target.value;
        const pattern = /\S+@\S+\.\S+/;
        const test = pattern.test(value);
        if(test){
          setEmail(false)
          setError('')
        }
        else{
          setEmail(true)
          return setError('Enter A Valid Email ID')
        }
    }
    const onPasswordChange=(event)=>{
        if(event.target.value.length<6){
            setPassword(true)
            return setError('Password Must Be Atleast 6 Letters/Numbers')
        }
        else{
            setPassword(false)
            setError('')
        }
    }
    return(
        
            <section className="flex flex-col items-center justify-center ">
                <h1 className="font-medium text-4xl text-center" style={{marginTop:'5vh',marginBottom:'5vh'}}>SIGN UP</h1>
           {/* 
           
           
           */}


           {error && <div class="alert flex flex-row items-center bg-red-200 p-5 rounded border-b-2 border-red-300 w-4/6" >
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
{/* 


*/}
               
                    <input id="email"className="py-2 px-2 my-5  rounded-lg w-4/6 mx-auto" onChange={onEmailChange} style={{backgroundColor:'#ecf0f1'}} type="email" placeholder="Enter Email"></input>
                    <input id="name" className="py-2 px-2 my-5  rounded-lg w-4/6 mx-auto" onChange={onNameChange} style={{backgroundColor:'#ecf0f1'}} type="text" placeholder="Enter Name"></input>
                    <input id="password" className="py-2 px-2 my-5  rounded-lg w-4/6 mx-auto" onChange={onPasswordChange} style={{backgroundColor:'#ecf0f1'}} type="password" placeholder="Enter Password"></input>
                    <input id="cpassword" className="py-2 px-2 my-5  rounded-lg w-4/6 mx-auto"  style={{backgroundColor:'#ecf0f1'}} type="password" placeholder="Confirm Password"></input>
                    
                    <Link onClick={onSignInClick} className="p-2 my-5 border-2 rounded-lg w-4/6  text-center" 
                   style={{marginLeft:"auto",marginRight:"auto",backgroundColor:'#7ed6df'}}><button disabled={loading ||email || name || password}  className="text-center" >SIGN UP</button></Link>
                 
                    
              
            </section>
        
    )


}

export default SignUp;