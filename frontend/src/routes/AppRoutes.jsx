import React from 'react'
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import UserRegister from '../pages/UserRegister'
import UserLogin from '../pages/UserLogin'
import FoodPartnerRegister from '../pages/FoodPartnerRegister'
import FoodPartnerLogin from '../pages/FoodPartnerLogin'
import AddFood from '../pages/foodPartner/addFood'
import LandingPage from '../pages/LandingPage'
import Home from '../pages/userHome/Home'
import PartnerProfile from '../pages/foodPartner/PartnerProfile'


const AppRoutes = () => {
  return (
    <Router>
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/foodpartner/register" element={<FoodPartnerRegister />} />
            <Route path="/foodpartner/login" element={<FoodPartnerLogin />} />
            <Route path="/home" element={<Home />} />
            <Route path="/foodpartner/add-food" element={<AddFood />} />
            <Route path="/foodpartner/:id" element={<PartnerProfile />} />
        </Routes>
    </Router>
  )
}

export default AppRoutes