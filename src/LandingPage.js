import {BrowserRouter as Router,Route} from 'react-router-dom'
import logIn from './logIn';
import signUp from './signUp';
import ctfy from './ctfy..png'
import classes from './LandingPage.module.css'

const LandingPage=()=>{
    return(
        <div className="bg-white h-6/6 border-2 rounded-lg flex " id={classes.container} style={{height:"80vh",width:'80vw',marginTop:"0"}}>
            <div className='w-1/2 p-0 flex flex-col items-center justify-center' style={{backgroundColor:'#93dbe9'}} id={classes.left}>
                {/* <div className="flex flex-col items-center justify-center"> */}
                   
                   <img  style={{marginTop:'-20%'}} src={ctfy}></img>
                   <p className="text-lg text-white mt-6 w-1/2">Real-time Chat Application with Video & Audio Call Features !</p>
                {/* </div> */}
            </div>
            <div className="w-1/2  p-0 border-2" id={classes.right}>
                <Router>
                    <Route  path="/" exact component={logIn}></Route>
                    <Route  path="/signup" exact component={signUp}></Route>
                </Router>
            </div>
        </div>
    )


}

export default LandingPage;