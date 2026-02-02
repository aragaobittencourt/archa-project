import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-app-bg flex flex-col">
            {/* Navigation (Renders Header on Desktop, Bottom Bar on Mobile) */}
            <Navigation />

            {/* Content Wrapper */}
            {/* layout-padding-fix removes the bottom padding on desktop where the nav is at the top */}
            <div className="layout-padding-fix" style={{ paddingBottom: '80px', flex: 1 }}>
                <Outlet />
            </div>
        </div>
    );
};

export default MainLayout;
