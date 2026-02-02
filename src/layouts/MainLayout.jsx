import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-app-bg">
            <div className="pb-24"> {/* Padding bottom for fixed nav */}
                <Outlet />
            </div>
            <BottomNav />
        </div>
    );
};

export default MainLayout;
