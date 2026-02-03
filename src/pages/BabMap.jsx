import React, { useState, useEffect } from 'react';
import BabMapSvg from '../components/BabMapSvg';

const CACHE_KEY = 'bab_map_content';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Biome content from WordPress
const biomeDescriptions = {
    'Amazônia': {
        description: 'Arquiteturas do bioma Amazônia que expressam território, cultura e saberes ancestrais, afirmando preservação, pertencimento e continuidade da vida.',
        color: '#1B5E20'
    },
    'Cerrado': {
        description: 'Arquiteturas do Cerrado expressam resistência e adaptação, conectando sol, terra e ancestralidade a visões de cotidiano e futuro.',
        color: '#FF6F00'
    },
    'Caatinga': {
        description: 'Arquiteturas da Caatinga transformam escassez em inteligência construtiva, celebrando o viver sertanejo, a cultura popular e a potência do semiárido.',
        color: '#FFA726'
    },
    'Mata Atlântica': {
        description: 'Arquiteturas da Mata Atlântica equilibram memória, paisagem e contemporaneidade, dialogando com patrimônio, natureza e modos de viver em transformação.',
        color: '#2E7D32'
    },
    'Pantanal': {
        description: 'Arquiteturas do Pantanal expressam fluidez, equilíbrio e cuidado ambiental, em profunda relação com o tempo, o clima e o território.',
        color: '#0277BD'
    },
    'Pampa': {
        description: 'Arquiteturas do Pampa valorizam afeto, pertencimento e o morar coletivo, expressando tradição, cotidiano e identidade cultural do Sul.',
        color: '#8D6E63'
    }
};

// Pátio Metrópole sponsors/lounges
const patioSpaces = [
    {
        title: 'Lounge Suvinil',
        description: 'O Lounge Suvinil apresenta, em primeira mão, a Cor do Ano Suvinil 2026, convidando o público a vivenciar a cor como experiência, tendência e expressão do morar contemporâneo.',
        icon: '🎨'
    },
    {
        title: 'Loja oficial Theodora Home',
        description: 'Linhas assinadas e exclusivas disponíveis apenas na Bienal, com curadoria de design que reflete a identidade contemporânea.',
        icon: '🏠'
    },
    {
        title: 'Restaurante Biomas',
        description: 'Operado pelo grupo Selvagem/Vista, o Restaurante Biomas oferece um menu exclusivo inspirado nos ingredientes e sabores dos biomas brasileiros, transformando a diversidade do território em experiência gastronômica.',
        icon: '🍽️'
    },
    {
        title: 'Lounge Architecture Hunter',
        description: 'Vídeos dedicados para cada espaço da Bienal, criando acervo audiovisual de alta qualidade sobre os projetos expostos.',
        icon: '🎬'
    },
    {
        title: 'Lounge Casa TCL',
        description: 'Ativação especial do Patrocinador Oficial das Olimpíadas, unindo tecnologia de ponta e experiência imersiva em arquitetura.',
        icon: '📺'
    },
    {
        title: 'Lounge Westwing',
        description: 'Espaço assinado por Rosenbaum Arquitetura e Design, showcasing de tendências em interiores e lifestyle.',
        icon: '✨'
    },
    {
        title: 'Quarto dos sonhos Zissou',
        description: 'Uma experiência de conforto e design por Rodrigo Ohtake.',
        icon: '🛏️'
    }
];

// Sponsor logos extracted from WordPress
const sponsorLogos = [
    { name: 'Westwing', src: 'https://archa.com.br/wp-content/uploads/2026/02/westwing.svg' },
    { name: 'Docol', src: 'https://archa.com.br/wp-content/uploads/2026/02/docol.svg' },
    { name: 'Electrolux', src: 'https://archa.com.br/wp-content/uploads/2026/02/electrolux.svg' },
    { name: 'Suvinil', src: 'https://archa.com.br/wp-content/uploads/2026/02/suvinil.svg' },
    { name: 'Portobello', src: 'https://archa.com.br/wp-content/uploads/2026/02/logo_portobello-black-1.svg' },
    { name: 'TCL', src: 'https://archa.com.br/wp-content/uploads/2026/02/TCL.svg' },
    { name: 'by Kamy', src: 'https://archa.com.br/wp-content/uploads/2026/02/by-kami.svg' },
    { name: 'ARCHA', src: 'https://archa.com.br/wp-content/uploads/2026/02/Logo-Archa-Azul-Escuro.svg' },
    { name: 'FLORA', src: 'https://archa.com.br/wp-content/uploads/2026/02/logo-flora-1.svg' },
    { name: 'Ingresse', src: 'https://archa.com.br/wp-content/uploads/2026/02/logo-ingresse-colorful.c63e2f05-1.svg' },
    { name: 'Copa Energia', src: 'https://archa.com.br/wp-content/uploads/2026/02/Mask-group.svg' },
    { name: 'apexBrasil', src: 'https://archa.com.br/wp-content/uploads/2026/02/Mask-group-1.svg' },
    { name: 'Zissou', src: 'https://archa.com.br/wp-content/uploads/2026/02/Mask-group-2.svg' },
    { name: 'Metrô SP', src: 'https://archa.com.br/wp-content/uploads/2026/02/sp-metro-logo-1024x315.png' },
    { name: 'b.', src: 'https://archa.com.br/wp-content/uploads/2026/02/9978b71f-6efd-4516-b5de-6b0faa45d82f___7538313698718bcfe1f265a72dd67e2f-1.svg' }
];

// Institutional sponsor logos
const institutionalLogos = [
    { name: 'CAU/BR', src: 'https://archa.com.br/wp-content/uploads/2026/02/cau.svg' },
    { name: 'ASBEA', src: 'https://archa.com.br/wp-content/uploads/2026/02/logo-asbea-azul-svg.svg' },
    { name: 'Architecture Hunter', src: 'https://archa.com.br/wp-content/uploads/2026/02/logo-ah-white-1.svg' }
];

const BabMap = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBiome, setSelectedBiome] = useState(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                // Check cache first
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const { data, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        setContent(data);
                        setLoading(false);
                        return;
                    }
                }

                // Fetch fresh data
                const response = await fetch('https://archa.com.br/wp-json/wp/v2/pages?slug=bab-mapa-do-evento');
                if (!response.ok) throw new Error('Failed to fetch content');

                const data = await response.json();
                if (data && data[0]) {
                    const pageData = {
                        title: data[0].title?.rendered || 'BAB Mapa do Evento',
                        content: data[0].content?.rendered || ''
                    };

                    // Cache the data
                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        data: pageData,
                        timestamp: Date.now()
                    }));

                    setContent(pageData);
                }
            } catch (err) {
                console.error('Error fetching content:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        localStorage.removeItem(CACHE_KEY);
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="bab-loading">
                <div className="bab-loading-spinner"></div>
                <p>Carregando conteúdo do mapa...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bab-error">
                <p>Erro ao carregar conteúdo: {error}</p>
                <button onClick={handleRetry} className="bab-retry-btn">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="bab-map-container">
            {/* Hero Section */}
            <section className="bab-map-hero">
                <h1>Explore o Evento</h1>
                <p>
                    Navegue pelo mapa e descubra os espaços do PACUBRA, o Pátio Metrópole
                    e os ambientes que compõem o evento.
                </p>
            </section>

            {/* Map Image Section */}
            <section className="bab-map-image-section">
                <img
                    src="https://archa.com.br/wp-content/uploads/2026/01/mapa-zp-ilustrativo-1-1.png"
                    alt="Mapa Ilustrativo do Evento BAB 2026"
                    className="bab-map-main-image"
                />
            </section>

            {/* Action Buttons */}
            <section className="bab-map-actions">
                <a
                    href="https://archa.com.br/wp-content/uploads/2026/01/mapa-bab-2026.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bab-map-btn bab-map-btn-primary"
                >
                    <svg className="bab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Baixar mapa do evento em PDF
                </a>
                <button className="bab-map-btn bab-map-btn-secondary">
                    <svg className="bab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Compartilhe com os amigos
                </button>
            </section>

            {/* Biomas Section */}
            <section className="bab-map-biomes">
                <div className="bab-section-header">
                    <h2>Biomas Brasileiros no Pacubra</h2>
                    <p>
                        Os biomas brasileiros revelam modos únicos de viver e construir.
                        Explore como a arquitetura traduz cada território, suas narrativas e identidades.
                    </p>
                    <p className="bab-biome-cta">
                        <strong>Escolha um bioma e conheça os projetos que o representam:</strong>
                    </p>
                </div>

                {/* Biome Navigation */}
                <div className="bab-biome-nav">
                    {Object.keys(biomeDescriptions).map((biome) => (
                        <button
                            key={biome}
                            className={`bab-biome-btn ${selectedBiome === biome ? 'active' : ''}`}
                            style={{
                                '--biome-color': biomeDescriptions[biome].color,
                                borderColor: selectedBiome === biome ? biomeDescriptions[biome].color : 'transparent'
                            }}
                            onClick={() => setSelectedBiome(selectedBiome === biome ? null : biome)}
                        >
                            {biome}
                        </button>
                    ))}
                </div>

                {/* Selected Biome Info */}
                {selectedBiome && (
                    <div
                        className="bab-biome-detail"
                        style={{ '--biome-color': biomeDescriptions[selectedBiome].color }}
                    >
                        <h3>{selectedBiome}</h3>
                        <p>{biomeDescriptions[selectedBiome].description}</p>
                    </div>
                )}

                {/* Interactive Map SVG */}
                <div className="bab-interactive-map">
                    <BabMapSvg />
                </div>
            </section>

            {/* Encontros Section */}
            <section className="bab-map-encontros">
                <h2>Encontros, Vozes e Experiências</h2>
                <p>
                    Um espaço dedicado a debates, palestras e conversas que aprofundam os temas
                    da Bienal, estimulando a troca de ideias e a reflexão coletiva sobre o
                    presente e o futuro da arquitetura, da cidade e do morar no Brasil.
                </p>
            </section>

            {/* Pátio Metrópole Section */}
            <section className="bab-map-patio">
                <div className="bab-section-header">
                    <h2>Pátio Metrópole: onde a cidade se encontra</h2>
                    <p>
                        O Pátio Metrópole é a área externa da BAB 2026 e se propõe a criar
                        uma cidade dentro da Bienal. Um espaço vivo, aberto e dinâmico, onde
                        arquitetura, marcas, pessoas e ideias se encontram por meio de
                        experimentações construtivas, instalações temáticas e ativações contemporâneas.
                    </p>
                </div>

                <div className="bab-patio-grid">
                    {patioSpaces.map((space, index) => (
                        <div key={index} className="bab-patio-card">
                            <div className="bab-patio-icon">{space.icon}</div>
                            <h3>{space.title}</h3>
                            <p>{space.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Sponsors Section */}
            <section className="bab-map-sponsors">
                <h2>Marcas Patrocinadores</h2>
                <div className="bab-sponsors-grid">
                    {sponsorLogos.map((logo, index) => (
                        <div key={index} className="bab-sponsor-logo">
                            <img src={logo.src} alt={logo.name} title={logo.name} />
                        </div>
                    ))}
                </div>
            </section>

            {/* Institutional Sponsors */}
            <section className="bab-map-institutional">
                <h2>Patrocínio Institucional</h2>
                <div className="bab-institutional-grid">
                    {institutionalLogos.map((logo, index) => (
                        <div key={index} className="bab-institutional-logo">
                            <img src={logo.src} alt={logo.name} title={logo.name} />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default BabMap;
