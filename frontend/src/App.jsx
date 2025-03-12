
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Home } from "./pages/home"
import { Demo } from "./pages/demo"
export default function App(){

  return(
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/demo' element={<Demo/>}/>
    </Routes>
    </BrowserRouter>
  )
}