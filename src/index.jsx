import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Default from 'Routes/default';
import MemberLogin from 'Routes/memberLogin';
import MusicCreator from 'Routes/profilePage/musicCreator';
import MusicCreatorPurchases from 'Routes/profilePage/musicCreatorPurchases';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Default />,
  },
  {
    path: "memberLogin",
    element: <MemberLogin />
  },
  {
    path: "musicCreator",
    element: <MusicCreator />,
    loader: ({ params }) => params
  },
  {
    path: "musicCreatorPurchases",
    element: <MusicCreatorPurchases />,
    loader: ({ params }) => params
  }
]);



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
