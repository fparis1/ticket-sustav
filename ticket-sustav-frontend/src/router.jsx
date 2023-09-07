import {createBrowserRouter, Navigate} from "react-router-dom";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";
import Login from "./views/Login";
import NotFound from "./views/NotFound";
import NewTechnicianForm from "./views/NewTechnicianForm.jsx";
import Tickets from "./views/Tickets.jsx";
import TicketForm from "./views/TicketForm.jsx";
import TicketShow from "./views/TicketShow.jsx";
import ClientForm from "./views/ClientForm.jsx";
import Clients from "./views/Clients.jsx";
import Technicians from "./views/Technicians.jsx";
import Comments from "./views/Comments.jsx";
import Subtasks from "./views/Subtasks.jsx";

const router = createBrowserRouter(
  
  [
  {
    path: '/',
    element: <DefaultLayout/>,
    children: [
      {
        path: '/',
        element: <Navigate to="/tickets"/>
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
        path: 'subtasks/:ticketId',
        element: <Subtasks key="subtaskShow"/>
      },
      {
        path: '/technicians/new',
        element: <NewTechnicianForm/>
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
      }
    ]
  },
  {
    path: "*",
    element: <NotFound/>
  }
])

export default router;
