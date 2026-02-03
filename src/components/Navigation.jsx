import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Calculator, Lightbulb, Heart, Map } from 'lucide-react';

const Navigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            id: 'projects',
            label: 'Projetos',
            icon: Calculator,
            path: '/'
        },
        {
            id: 'tips',
            label: 'Dicas',
            icon: Lightbulb,
            path: '/dicas'
        },
        {
            id: 'map',
            label: 'Mapa',
            icon: Map,
            path: '/mapa'
        },
        {
            id: 'benfeitoria',
            label: 'Benfeitoria',
            icon: Heart,
            path: '/benfeitoria'
        }
    ];

    return (
        <>
            {/* Desktop Header Navigation */}
            <header className="desktop-header">
                <div className="desktop-nav-container">
                    <Link to="/" className="desktop-logo" style={{ textDecoration: 'none' }}>
                        <h1>Haus <span>Archa</span></h1>
                    </Link>

                    <nav className="desktop-nav-links">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className={`desktop-link ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="bottom-nav">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <div className="nav-icon-wrapper">
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </>
    );
};

export default Navigation;
