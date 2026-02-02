import { useNavigate, useLocation } from 'react-router-dom';
import { Calculator, Lightbulb } from 'lucide-react';

const BottomNav = () => {
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
        }
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-navy border-t border-white/10 px-6 py-3 z-50 safe-area-bottom">
            <div className="flex justify-around items-center max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-lime transform -translate-y-1' : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNav;
