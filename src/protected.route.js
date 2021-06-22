import React from "react";
import { Route, Redirect } from "react-router-dom";
import {useAuth} from './context/AuthContext'

export const ProtectedRoute = ({
  component: Component,
  ...rest
}) => {
  const{currentUser}=useAuth();
  return (
    <Route
      {...rest}
      render={props => {
        if (currentUser!=null) {
          console.log(currentUser)
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/",
                state: {
                  from: props.location
                }
              }}
            />
          );
        }
      }}
    />
  );
};
