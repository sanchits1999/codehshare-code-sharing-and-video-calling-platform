import React, { useEffect } from 'react'
import { BrowserRouter, Route } from "react-router-dom"
import Room from "./components/Room/Room"


const App = (props) => {

  return (
    <div>
      <BrowserRouter>
        <Route path="/:room" exact component={Room} />
      </BrowserRouter>
    </div>
  )
}


export default App 
