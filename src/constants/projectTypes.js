export const PROJECT_TYPES = [
    // Residencial
    { id: 'apartamento', label: 'Apartamento', category: 'Residencial', adjustment: 0, icon: '🏢' },
    { id: 'casa', label: 'Casa', category: 'Residencial', adjustment: 0.05, icon: '🏠' },

    // Comercial
    { id: 'hotelaria', label: 'Hotelaria', category: 'Comercial', adjustment: 0.15, icon: '🏨' },
    { id: 'bares_restaurantes', label: 'Bares e Restaurantes', category: 'Comercial', adjustment: 0.10, icon: '🍽️' },
    { id: 'lojas_varejo', label: 'Lojas Varejo', category: 'Comercial', adjustment: 0.07, icon: '🛍️' },
    { id: 'clinicas', label: 'Clínicas', category: 'Comercial', adjustment: 0.07, icon: '🏥' },

    // Corporativo
    { id: 'escritorio', label: 'Escritório', category: 'Corporativo', adjustment: 0.10, icon: '💼' },
    { id: 'estandes', label: 'Estandes', category: 'Corporativo', adjustment: 0, icon: '🏗️' },
    { id: 'eventos', label: 'Eventos e Palcos', category: 'Corporativo', adjustment: 0, icon: '🎭' },
];

export const CATEGORIES = ['Residencial', 'Comercial', 'Corporativo'];

export const ARCHITECT_LEVELS = [
    {
        id: 'estreante',
        label: 'Estreantes',
        description: 'Qualificados, mas com pouca experiência em concorrências.',
        adjustment: 0,
        icon: '👨‍💼',
        color: 'var(--color-lime)'
    },
    {
        id: 'verificado',
        label: 'Verificados',
        description: 'Qualificados, treinados e com experiência em projetos pela Archa.',
        adjustment: 0.20,
        icon: '✅',
        color: '#a0aec0'
    },
    {
        id: 'preferido',
        label: 'Preferidos',
        description: 'Os mais escolhidos pelos nossos clientes! Portfólio e desempenho de excelência.',
        adjustment: 0.50, // +50%
        icon: '🏆',
        color: '#fbbf24'
    },
];

export const PROJECT_ADDONS = [
    { id: 'marcenaria', label: 'Uso de marcenaria', adjustment: 0.03, icon: 'Hammer' },
    { id: 'pintura', label: 'Pinturas de paredes e/ou pisos', adjustment: 0.02, icon: 'PaintRoller' },
    { id: 'pisos', label: 'Novos pisos (madeira, porcelanato ou outro tipo)', adjustment: 0.03, icon: 'Grid' },
    { id: 'marmore', label: 'Uso de mármore ou granito', adjustment: 0.03, icon: 'LayoutTemplate' }, // Stone-like icon
    { id: 'altura_teto', label: 'Alteração da altura do teto', adjustment: 0.03, icon: 'Ruler' },
    { id: 'alvenaria', label: 'Paredes de alvenaria ou drywall', adjustment: 0.03, icon: 'BrickWall' },
    { id: 'eletrodomesticos', label: 'Novos eletrodomésticos, luminárias e/ou lâmpadas', adjustment: 0.03, icon: 'LampCeiling' },
    { id: 'metais', label: 'Trocar/adicionar chuveiro, torneiras e/ou vaso sanitário', adjustment: 0.03, icon: 'Droplets' },
    { id: 'tomadas', label: 'Trocar/adicionar tomadas e interruptores', adjustment: 0.03, icon: 'Plug' },
];
