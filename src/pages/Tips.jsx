import { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Loader2 } from 'lucide-react';

function Tips() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const response = await fetch(
                    'https://api.rss2json.com/v1/api.json?rss_url=https://cms.revistahaus.com.br/feed/'
                );
                const data = await response.json();

                if (data.status === 'ok') {
                    setPosts(data.items);
                } else {
                    throw new Error('Falha ao carregar o feed');
                }
            } catch (err) {
                console.error("Erro ao buscar feed:", err);
                setError('Não foi possível carregar as dicas no momento.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    // Format Date Function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Helper to extract image from description if thumbnail is missing
    const getThumbnail = (item) => {
        if (item.thumbnail) return item.thumbnail;
        if (item.enclosure?.link) return item.enclosure.link;

        // Try regex on description content
        const imgRegex = /<img.*?src="(.*?)"/;
        const match = item.content.match(imgRegex) || item.description.match(imgRegex);
        if (match) return match[1];

        return 'https://placehold.co/600x400/262942/D4FFAE?text=Archa+Dicas'; // Fallback
    };

    if (loading) {
        return (
            <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-lime)' }}>
                <div className="loader" style={{ animation: 'spin 1s linear infinite' }}>
                    <Loader2 size={48} />
                </div>
            </div>
        );
    }

    return (
        <div className="tips-container">
            {/* Header */}
            <header className="tips-header">
                <h1 className="tips-title">Haus <span>Dicas</span></h1>
                <p className="tips-subtitle">inspiração para o seu projeto</p>
            </header>

            {/* Content */}
            <div className="container">
                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem'
                    }}>
                        {error}
                    </div>
                )}

                <div className="tips-grid">
                    {posts.map((post, index) => (
                        <article key={index} className="tip-card">
                            {/* Image */}
                            <div className="tip-image-wrapper">
                                <img
                                    src={getThumbnail(post)}
                                    alt={post.title}
                                    className="tip-image"
                                    onError={(e) => { e.target.src = 'https://placehold.co/600x400/262942/D4FFAE?text=Archa' }}
                                />
                                <div className="tip-date">
                                    <Calendar size={12} />
                                    {formatDate(post.pubDate)}
                                </div>
                            </div>

                            {/* Body */}
                            <div className="tip-content">
                                <h2 className="tip-title">{post.title}</h2>

                                <div
                                    className="tip-excerpt"
                                    dangerouslySetInnerHTML={{ __html: post.description.replace(/<img[^>]*>/g, '').substring(0, 150) + '...' }}
                                />

                                <a
                                    href={post.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tip-link"
                                >
                                    Ler matéria completa
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </article>
                    ))}
                </div>

                <div style={{ textAlign: 'center', color: '#888', padding: '2rem 0', fontSize: '0.9rem' }}>
                    Conteúdo provido por Revista Haus
                </div>
            </div>

            <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
        </div>
    );
}

export default Tips;
