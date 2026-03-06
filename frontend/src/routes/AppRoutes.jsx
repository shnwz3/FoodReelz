import React from 'react'
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import UserRegister from '../pages/UserRegister'
import UserLogin from '../pages/UserLogin'
import FoodPartnerRegister from '../pages/FoodPartnerRegister'
import FoodPartnerLogin from '../pages/FoodPartnerLogin'
import LandingPage from '../pages/LandingPage'
import Home from '../pages/userHome/Home'
import PartnerProfile from '../pages/foodPartner/PartnerProfile'

import PublicRoute from '../components/routes/PublicRoute'
import ProtectedRoute from '../components/routes/ProtectedRoute'

const AppRoutes = () => {
  return (
    <Router>
        <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/user/register" element={<UserRegister />} />
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/foodpartner/register" element={<FoodPartnerRegister />} />
              <Route path="/foodpartner/login" element={<FoodPartnerLogin />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRole="user" />}>
              <Route path="/home" element={<Home />} />
            </Route>

            <Route path="/foodpartner/:id" element={<PartnerProfile />} />
        </Routes>
    </Router>
  )
}

export default AppRoutes