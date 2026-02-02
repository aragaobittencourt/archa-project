
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';

const ConfigContext = createContext();

export const useConfig = () => useContext(ConfigContext);

export const ConfigProvider = ({ children }) => {
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase.from('config_globais').select('*');
            if (error) throw error;

            const configMap = {};
            data.forEach(item => {
                configMap[item.key] = Number(item.value);
            });
            setConfig(configMap);
        } catch (err) {
            console.error('Error fetching config:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    // Helper to get value with fallback
    const getValue = (key, fallback) => {
        return config[key] !== undefined ? config[key] : fallback;
    };

    const refreshConfig = fetchConfig;

    return (
        <ConfigContext.Provider value={{ config, getValue, loading, refreshConfig }}>
            {children}
        </ConfigContext.Provider>
    );
};
