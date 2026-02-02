
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useConfig } from '../context/ConfigContext';

function Admin() {
    const { refreshConfig } = useConfig();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [password, setPassword] = useState('');
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        if (authenticated) {
            loadData();
        }
    }, [authenticated]);

    const loadData = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('config_globais').select('*').order('category', { ascending: true });
        if (data) setItems(data);
        setLoading(false);
    };

    const handleUpdate = async (key, newValue) => {
        try {
            const val = parseFloat(newValue);
            const { error } = await supabase.from('config_globais').update({ value: val }).eq('key', key);

            if (error) throw error;

            // Update local state to reflect change immediately
            setItems(items.map(i => i.key === key ? { ...i, value: val } : i));

            // Refresh global context so calculator updates
            refreshConfig();

            alert('Atualizado com sucesso!');
        } catch (err) {
            alert('Erro ao atualizar: ' + err.message);
        }
    };

    if (!authenticated) {
        return (
            <div style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
                <h2>Acesso Restrito</h2>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Senha de Admin"
                    style={{ padding: '0.5rem', width: '100%', marginBottom: '1rem' }}
                />
                <button
                    onClick={() => {
                        if (password === 'archa123') setAuthenticated(true);
                        else alert('Senha incorreta');
                    }}
                    style={{ width: '100%', padding: '0.5rem', background: '#333', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    Entrar
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>Painel de Configuração</h1>
            <p>Altere os valores abaixo para atualizar o simulador em tempo real.</p>

            {loading ? <p>Carregando...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                            <th style={{ padding: '0.5rem' }}>Categoria</th>
                            <th style={{ padding: '0.5rem' }}>Descrição</th>
                            <th style={{ padding: '0.5rem' }}>Valor Atual</th>
                            <th style={{ padding: '0.5rem' }}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.key} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '0.5rem', fontSize: '0.8rem', color: '#666' }}>{item.category}</td>
                                <td style={{ padding: '0.5rem' }}>{item.description || item.key}</td>
                                <td style={{ padding: '0.5rem' }}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        defaultValue={item.value}
                                        id={`input-${item.key}`}
                                        style={{ padding: '0.25rem', width: '80px' }}
                                    />
                                </td>
                                <td style={{ padding: '0.5rem' }}>
                                    <button
                                        onClick={() => {
                                            const val = document.getElementById(`input-${item.key}`).value;
                                            handleUpdate(item.key, val);
                                        }}
                                        style={{ padding: '0.25rem 0.5rem', background: 'var(--color-navy)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Salvar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <div style={{ marginTop: '2rem' }}>
                <button onClick={() => window.location.href = '/'} style={{ textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                    &larr; Voltar para o Simulador
                </button>
            </div>
        </div>
    );
}

export default Admin;
