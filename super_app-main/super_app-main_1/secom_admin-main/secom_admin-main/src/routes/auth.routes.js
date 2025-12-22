import React from "react";
import SignIn from "../views/auth/SignIn";
import SignUp from "../views/auth/SignUp";

const authRoutes = [
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    component: <SignIn />,
  },
  {
    name: "Sign Up",
    layout: "/auth",
    path: "sign-up",
    component: <SignUp />,
  },
];

export default authRoutes; 