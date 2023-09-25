import React from 'react';
import { CookiesProvider } from 'react-cookie';
import ReactDOM from 'react-dom/client';
import {
  createHashRouter,
  RouterProvider
} from "react-router-dom";
import Authenticate from 'Routes/authenticate';
import Default from 'Routes/default';
import ErrorPage from 'Routes/error';
import MemberLogin from 'Routes/memberLogin';
import MusicCreatorPurchases from 'Routes/profilePage/musicCreatorPurchases';
import Signup from 'Routes/signup';
import SiteLayout from '~/siteLayout';
import reportWebVitals from './reportWebVitals';

//NOTE: Github Pages does not support BrowserRouter
const router = createHashRouter([
  {
    element: <SiteLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Default />,
        errorElement: <ErrorPage />,
      },
      {
        path: "memberLogin",
        element: <MemberLogin />,
        errorElement: <ErrorPage />,
      },
      {
        path: "signup",
        element: <Signup />,
        errorElement: <ErrorPage />,
      },
      {
        path: "authenticate",
        element: <Authenticate />,
        errorElement: <ErrorPage />,
      },
      {
        path: "musicCreator/:id?",
        errorElement: <ErrorPage />,
        // https://reactrouter.com/en/main/route/lazy
        lazy: () => import('Routes/profilePage/musicCreator'),
      },
      {
        path: "musicCreatorPurchases",
        element: <MusicCreatorPurchases />,
        errorElement: <ErrorPage />,
        loader: ({ params }) => params,
      },
      {
        path: "albums",
        lazy: () => import('Routes/albums'),
      },
      {
        path: "my_albums",
        lazy: () => import('Routes/my_albums'),
      },
      {
        path: "my_purchased_albums",
        lazy: () => import('~/routes/my_purchased_albums'),
      },
      {
        path: "musicGenerator",
        lazy: () => import('Routes/musicGenerator'),
      },
    ]
  }
], {
  //basename: import.meta.env.BASE_URL, //Only for BrowserRouter
});

//TODO: remove react-cookies dependency
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CookiesProvider>
      <RouterProvider router={router} fallbackElement={<h1>Loading...</h1>} />
    </CookiesProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
