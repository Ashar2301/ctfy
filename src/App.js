import logo from './logo.svg';
import classes from './App.module.css';
import {BrowserRouter as Router,Route, Switch} from 'react-router-dom'
import LandingPage from './LandingPage'
import Dashboard from './dashboard'
import {AuthProvider} from './context/AuthContext'
import { ProtectedRoute } from './protected.route'
function App() {
  return (
    <div  className={classes.div} >
      <AuthProvider>
      <Router>

         <Switch>
         <Route path="/" exact component={LandingPage}></Route> 
        <ProtectedRoute path="/dashboard" exact component={Dashboard}></ProtectedRoute> 
        <Route path="*" exact component={()=>"404 NOT FOUND"}></Route>
        </Switch>
      </Router>
      </AuthProvider>
      
    </div>
  );
}

export default App;
