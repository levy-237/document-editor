import { useState } from "react";
import Editor from "./Editor";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
  Link,
  useLocation,
} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/"
        element={<Navigate to={`documents/${uuidv4()}`} replace />}
      />
      <Route path="/documents/:id" element={<Editor />} />
    </>
  )
);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
