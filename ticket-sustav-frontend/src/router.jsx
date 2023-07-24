import {createBrowserRouter, Navigate} from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import Signup from "./views/Signup";
import Tickets from "./views/Tickets.jsx";
import TicketForm from "./views/TicketForm.jsx";
import TicketShow from "./views/TicketShow.jsx";
import ClientForm from "./views/ClientForm.jsx";
import Clients from "./views/Clients.jsx";
import Technicians from "./views/Technicians.jsx";
import Comments from "./views/Comments.jsx";
import CommentForm from "./views/CommentForm.jsx";

const router = createBrowserRouter(
  
  [
  {
    path: '/',
    element: <DefaultLayout/>,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard"/>
      },
      {
        path: '/dashboard',
        element: <Dashboard/>
      },
      {
        path: '/tickets',
        element: <Tickets/>
      },
      {
        path: '/tickets/new',
        element: <TicketForm key="ticketCreate" />
      },
      {
        path: '/tickets/:id',
        element: <TicketForm key="ticketUpdate" />
      },
      {
        path: '/tickets/:id/:id',
        element: <TicketShow key="ticketShow" />
      },
      {
        path: '/clients',
        element: <Clients/>
      },
      {
        path: '/clients/new',
        element: <ClientForm key="clientCreate" />
      },
      {
        path: '/clients/:id',
        element: <ClientForm key="clientUpdate" />
      },
      {
        path: '/technicians',
        element: <Technicians/>
      },
      {
        path: '/comments/:ticketId',
        element: <Comments key="commentShow"/>
      },
      {
        path: '/comments/:ticketId/new',
        element: <CommentForm key="commentCreate"/>
      }
    ]
  },
  {
    path: '/',
    element: <GuestLayout/>,
    children: [
      {
        path: '/login',
        element: <Login/>
      },
      {
        path: '/signup',
        element: <Signup/>
      }
    ]
  },
  {
    path: "*",
    element: <NotFound/>
  }
])

export default router;
