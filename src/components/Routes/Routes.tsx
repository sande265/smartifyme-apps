import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from '../../App';
import Home from '../pages/Home';

const AppRoutes: React.FC<{}> = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />}>
                    {/* <Route index element={} /> */}
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;