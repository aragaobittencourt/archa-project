import { useState, useEffect, useRef, useMemo } from 'react';
import { calculateProjectValue, formatCurrency } from '../utils/calculator';
import { PROJECT_TYPES, CATEGORIES, ARCHITECT_LEVELS, PROJECT_ADDONS } from '../constants/projectTypes';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { useConfig } from '../context/ConfigContext';
import { Hammer, PaintRoller, Grid, LayoutTemplate, Ruler, BrickWall, LampCeiling, Droplets, Plug, TrendingUp, Percent, Check } from 'lucide-react';

const iconMap = {
  Hammer, PaintRoller, Grid, LayoutTemplate, Ruler, BrickWall, LampCeiling, Droplets, Plug, TrendingUp, Percent
};

// Moved PACKAGES inside component or dynamic hook


function Calculator() {
  const { getValue, loading: configLoading } = useConfig();

  const PACKAGES = useMemo(() => [
    {
      id: 'solo',
      label: 'SOLO',
      multiplier: getValue('pacote_solo', 1),
      benefits: [
        'Moodboard e referências',
        'Planta de layout e obra civil',
        'Memorial descritivo',
        '2 revisões',
        'Assistente pessoal'
      ]
    },
    {
      id: 'duo',
      label: 'DUO',
      multiplier: getValue('pacote_duo', 2.4445),
      recommended: true,
      benefits: [
        'Tudo do Solo +',
        '2 projetos completos',
        'Vídeos explicativos',
        'Desconto de 10% em serviços'
      ]
    },
    {
      id: 'trio',
      label: 'TRIO',
      multiplier: getValue('pacote_trio', 3.3333),
      benefits: [
        'Tudo do Duo +',
        '3 propostas de projetos',
        'Planilha de orçamento',
        '+1 reunião de revisão',
        'Desconto de 20% em serviços'
      ]
    }
  ], [getValue]);

  const [metragem, setMetragem] = useState('');
  const [ambientes, setAmbientes] = useState('');
  const [activeCategory, setActiveCategory] = useState('Residencial');
  const [projectType, setProjectType] = useState('');
  const [architectLevel, setArchitectLevel] = useState('estreante');
  const [locationScope, setLocationScope] = useState('brasil'); // 'brasil' | 'region'
  const [selectedAddons, setSelectedAddons] = useState([]); // Array of IDs
  const [isNewConstruction, setIsNewConstruction] = useState('no'); // 'yes' | 'no'
  const [selectedPackage, setSelectedPackage] = useState('duo');
  const [deadline, setDeadline] = useState('21'); // '15', '21', '28'
  const [result, setResult] = useState(null);
  const sessionIdRef = useRef(null);

  // Initialize Session ID once
  useEffect(() => {
    let storedSession = localStorage.getItem('archa_session_id');
    if (!storedSession) {
      storedSession = uuidv4();
      localStorage.setItem('archa_session_id', storedSession);
    }
    sessionIdRef.current = storedSession;
  }, []);

  // Set default project type when category changes

  // Set default project type when category changes
  useEffect(() => {
    const currentTypeObj = PROJECT_TYPES.find(t => t.id === projectType);
    if (!currentTypeObj || currentTypeObj.category !== activeCategory) {
      const firstInCat = PROJECT_TYPES.find(t => t.category === activeCategory);
      if (firstInCat) {
        setProjectType(firstInCat.id);
      }
    }
  }, [activeCategory, projectType]);


  // Lead State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Validation State
  const [errors, setErrors] = useState({});
  const [isLeadValid, setIsLeadValid] = useState(false);

  // Calculate automatically when inputs change
  useEffect(() => {
    // Only calculate if we have valid numbers
    if (metragem && ambientes && projectType) {
      // Dynamic Type Adjustment
      const typeObj = PROJECT_TYPES.find(t => t.id === projectType);
      // Construct key like 'tipo_casa', 'tipo_hotelaria'
      // Only special cases map to config keys, or mapped all?
      // Mapping: 
      // casa -> tipo_casa
      // hotelaria -> tipo_hotelaria
      // bares_restaurantes -> tipo_bares
      // lojas_varejo -> tipo_lojas
      // clinicas -> tipo_clinicas
      // escritorio -> tipo_escritorio
      // others -> 0 or default

      let adj = 0;
      if (typeObj) {
        if (typeObj.id === 'casa') adj = getValue('tipo_casa', 0.05);
        else if (typeObj.id === 'hotelaria') adj = getValue('tipo_hotelaria', 0.15);
        else if (typeObj.id === 'bares_restaurantes') adj = getValue('tipo_bares', 0.10);
        else if (typeObj.id === 'lojas_varejo') adj = getValue('tipo_lojas', 0.07);
        else if (typeObj.id === 'clinicas') adj = getValue('tipo_clinicas', 0.07);
        else if (typeObj.id === 'escritorio') adj = getValue('tipo_escritorio', 0.10);
        else adj = typeObj.adjustment; // Fallback to constant
      }

      const levelObj = ARCHITECT_LEVELS.find(l => l.id === architectLevel);
      const lvlAdj = levelObj ? levelObj.adjustment : 0; // Levels are not in config yet, keep constant

      const locAdj = locationScope === 'region' ? 0.10 : 0;

      const addonsAdj = selectedAddons.reduce((acc, id) => {
        // Map addons to config keys
        let val = 0;
        if (id === 'marcenaria') val = getValue('add_marcenaria', 0.03);
        else if (id === 'pintura') val = getValue('add_pintura', 0.02);
        else if (id === 'pisos') val = getValue('add_pisos', 0.03);
        else if (id === 'marmore') val = getValue('add_marmore', 0.03);
        else if (id === 'altura_teto') val = getValue('add_teto', 0.03);
        else if (id === 'alvenaria') val = getValue('add_alvenaria', 0.03);
        else if (id === 'eletrodomesticos') val = getValue('add_eletro', 0.03);
        else if (id === 'metais') val = getValue('add_metais', 0.03);
        else if (id === 'tomadas') val = getValue('add_tomadas', 0.03);
        else {
          const item = PROJECT_ADDONS.find(addon => addon.id === id);
          val = item ? item.adjustment : 0;
        }
        return acc + val;
      }, 0);

      const newConstAdj = isNewConstruction === 'yes' ? getValue('add_novo_ambiente', 0.15) : 0;

      let deadlineAdj = 0;
      if (deadline === '15') deadlineAdj = getValue('prazo_15', 0.30);
      else if (deadline === '21') deadlineAdj = getValue('prazo_21', 0.0);
      else if (deadline === '28') deadlineAdj = getValue('prazo_28', -0.05);

      // Pass fees if calculator supports them? Calculator has hardcoded fees.
      // We need to update calculator.js to accept fees OR calculator.js is fine and returns projectCost
      // and we apply fees here?
      // Currently calculateProjectValue applies fees internally. We should probably pass them.
      // But calculateProjectValue signature is fixed.
      // Let's modify calculateProjectValue to accept an options object or extra params.

      const res = calculateProjectValue(
        Math.max(20, Number(metragem)),
        ambientes,
        adj,
        lvlAdj,
        locAdj,
        addonsAdj,
        newConstAdj,
        deadlineAdj,
        getValue('taxa_archa', 0.33),
        getValue('taxa_finder', 0.25)
      );
      setResult(res);
    } else {
      setResult(null);
    }
  }, [metragem, ambientes, projectType, architectLevel, locationScope, selectedAddons, isNewConstruction, deadline, getValue]);

  // Autosave to Supabase (Debounced)
  useEffect(() => {
    // Determine timeout to avoid saving on every keystroke
    const timer = setTimeout(async () => {
      // Must have at least a name to start saving, or maybe just save everything anonymously first?
      // Requirement: "Quero gravar o nome, email e telefone... e cada um dos dados da simulação".
      // We will save even if name is empty, to track the simulation parameters.

      if (!sessionIdRef.current) return;

      const payload = {
        id: sessionIdRef.current,
        nome: name,
        email: email,
        telefone: phone,
        metragem: metragem ? parseFloat(metragem) : null,
        ambientes: ambientes ? parseInt(ambientes) : null,
        tipo_projeto: projectType,
        pacote_selecionado: selectedPackage,
        valor_investimento_total: result ? result.total : null,
        adicionais: selectedAddons,
        prazo: deadline,
        updated_at: new Date().toISOString()
      };

      try {
        const { error } = await supabase
          .from('leads_simulacoes')
          .upsert(payload, { onConflict: 'id' });

        if (error) {
          console.error('Error saving to Supabase:', error);
        } else {
          // console.log('Autosaved to Supabase', payload);
        }
      } catch (err) {
        console.error('Supabase catch error:', err);
      }

    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [name, email, phone, metragem, ambientes, projectType, selectedPackage, result, selectedAddons, deadline]); // Dependencies trigger save


  // Validate Lead Form
  useEffect(() => {
    const newErrors = {};
    let valid = true;

    // Skip validating empty initial state
    if (name === '' && email === '' && phone === '') {
      setIsLeadValid(false);
      setErrors({});
      return;
    }

    if (!name.trim()) {
      valid = false;
    } else if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/.test(name)) {
      newErrors.name = 'Nome deve conter apenas letras.';
      valid = false;
    }

    if (!email.trim()) {
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Digite um e-mail válido.';
      valid = false;
    }

    const digits = phone.replace(/\D/g, '');
    if (!phone.trim()) {
      valid = false;
    } else if (digits.length < 10 || digits.length > 11) {
      newErrors.phone = 'Digite um telefone válido (min 10 dígitos).';
      valid = false;
    }

    const hasAllFields = name && email && phone;

    setErrors(newErrors);
    setIsLeadValid(valid && hasAllFields);
  }, [name, email, phone]);

  return (
    <div className="App">
      <header className="hero-section">
        <div className="container">
          <span className="subtitle">Simulador Online</span>
          <h1>
            Quanto custa seu<br />
            <span className="highlight">projeto de arquitetura?</span>
          </h1>
          <p className="hero-text">
            Descubra o valor estimado do seu projeto com base nas características do seu espaço.
          </p>
        </div>
      </header>

      <main className="container main-content">
        <div className="calculator-card">
          <form className="calc-form" onSubmit={(e) => e.preventDefault()}>

            {/* 1. Project Type Selection */}
            <div className="form-section">
              <label className="section-label">1. Conte-nos sobre seu espaço!</label>

              {/* Category Tabs */}
              <div className="category-tabs">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    className={`tab-button ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                    type="button"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Type Grid */}
              <label className="section-label sub-label">Selecione o tipo de espaço</label>
              <div className="type-grid">
                {PROJECT_TYPES.filter(t => t.category === activeCategory).map(type => (
                  <div
                    key={type.id}
                    className={`type-card ${projectType === type.id ? 'selected' : ''}`}
                    onClick={() => setProjectType(type.id)}
                  >
                    <span className="type-icon">{type.icon}</span>
                    <span className="type-label">{type.label}</span>
                  </div>
                ))}
              </div>
            </div>



            <div className="form-divider"></div>

            {/* 3. Measurements */}
            <div className="form-section">
              <label className="section-label">Dimensões do Projeto</label>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="metragem">Metragem (m²)</label>
                  <input
                    type="number"
                    id="metragem"
                    value={metragem}
                    onChange={(e) => setMetragem(e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    placeholder="Ex: 50"
                    min="20"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ambientes">Quantos ambientes?</label>
                  <input
                    type="number"
                    id="ambientes"
                    value={ambientes}
                    onChange={(e) => setAmbientes(e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    placeholder="Ex: 3"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* 4. Lead Generation */}
            <div className="lead-section" style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--color-navy)', fontSize: '1.2rem' }}>
                2. Seus dados de contato
              </h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                Preencha os campos abaixo para visualizar o valor estimado.
              </p>

              <div className="form-group">
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  style={{ borderColor: errors.name ? 'red' : undefined }}
                />
                {errors.name && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    style={{ borderColor: errors.email ? 'red' : undefined }}
                  />
                  {errors.email && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Telefone (com DDD)</label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    style={{ borderColor: errors.phone ? 'red' : undefined }}
                  />
                  {errors.phone && <span style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{errors.phone}</span>}
                </div>
              </div>
            </div>

            {/* Steps 3 & 4 (Moved inside form) */}
            {result && isLeadValid && (
              <>
                <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Escolha seu Pacote</h3>

                <div className="packages-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
                  {PACKAGES.map(pkg => {
                    const pkgValue = result.total * pkg.multiplier;
                    const isSelected = selectedPackage === pkg.id;

                    return (
                      <div
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`package-card ${isSelected ? 'selected' : ''}`}
                        style={{
                          border: isSelected ? '2px solid var(--color-lime)' : '1px solid transparent',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          background: isSelected ? 'white' : 'rgba(255, 255, 255, 0.9)',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s ease',
                          color: 'var(--color-navy)', // Force dark text
                          marginBottom: '0.5rem'
                        }}
                      >
                        {pkg.recommended && (
                          <div style={{
                            position: 'absolute',
                            top: '-12px',
                            left: '1rem',
                            background: 'var(--color-lime)',
                            color: 'var(--color-navy)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                          }}>
                            Recomendado
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                          <div>
                            <h4 style={{ textTransform: 'uppercase', color: 'var(--color-navy)', margin: 0, fontWeight: 800 }}>{pkg.label}</h4>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-navy)' }}>
                              10x de {formatCurrency(pkgValue / 10)}
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#555' }}>
                              ou à vista {formatCurrency(pkgValue * 0.85)} (15% OFF)
                            </div>
                          </div>
                          <div className="radio-circle" style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: isSelected ? '6px solid var(--color-lime)' : '2px solid #ccc',
                            backgroundColor: isSelected ? 'var(--color-navy)' : 'white',
                          }}></div>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {pkg.benefits.map((benefit, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#444' }}>
                              <Check size={16} color="var(--color-lime)" style={{ marginTop: '2px', flexShrink: 0 }} />
                              <span style={{ color: '#333' }}>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                <div className="result-header" style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                  <h3>Investimento Total ({PACKAGES.find(p => p.id === selectedPackage).label})</h3>
                  <div className="total-value">{formatCurrency(result.total * PACKAGES.find(p => p.id === selectedPackage).multiplier)}</div>
                </div>

                <div className="result-breakdown">
                  <div className="breakdown-item">
                    <span>Valor base p/ m²</span>
                    <strong>{formatCurrency(result.details.valM2)}</strong>
                  </div>
                  <div className="breakdown-item">
                    <span>Valor base p/ ambiente</span>
                    <strong>{formatCurrency(result.details.valEnv)}</strong>
                  </div>
                  <div className="breakdown-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                    <span>Valor Base Total</span>
                    <strong>{formatCurrency(result.details.baseTotal)}</strong>
                  </div>
                  {architectLevel !== 'estreante' && (
                    <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.5rem' }}>
                      <span>Perfil {ARCHITECT_LEVELS.find(l => l.id === architectLevel)?.label}</span>
                      <strong>+{Math.round((ARCHITECT_LEVELS.find(l => l.id === architectLevel)?.adjustment || 0) * 100)}%</strong>
                    </div>
                  )}
                  {locationScope === 'region' && (
                    <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.25rem' }}>
                      <span>Regional (+10%)</span>
                      <strong>+{formatCurrency(result.total - (result.total / (1 + selectedAddons.reduce((acc, id) => acc + (PROJECT_ADDONS.find(a => a.id === id)?.adjustment || 0), 0)) / 1.10))}</strong>
                      {/* Note: logic to calculate breakdown delta is complex with cumulative. Simplifying relative to previous step is tricky without more state. 
                          For now, showing strict % based on final. 
                          Actually safest is to just show the count of items or a generic "Adicionais" line? 
                          Let's try to calculate the value added by addons specifically.
                          ValueWithoutAddons = Total / (1 + AddonsPct). AddonsValue = Total - ValueWithoutAddons.
                      */}
                    </div>
                  )}
                  {selectedAddons.length > 0 && (
                    <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.25rem' }}>
                      <span>Adicionais ({selectedAddons.length})</span>
                      <strong>+{formatCurrency(result.total - (result.total / (1 + selectedAddons.reduce((acc, id) => acc + (PROJECT_ADDONS.find(a => a.id === id)?.adjustment || 0), 0))))}</strong>
                    </div>
                  )}
                  {isNewConstruction === 'yes' && (
                    <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.25rem' }}>
                      <span>Nova Área/Fachada (+15%)</span>
                      <strong>+{formatCurrency(result.total - (result.total / 1.15))}</strong>
                    </div>
                  )}
                  {deadline === '15' && (
                    <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.25rem' }}>
                      <span>Urgência 15 Dias (+30%)</span>
                      <strong>+{formatCurrency(result.total - (result.total / 1.30))}</strong>
                    </div>
                  )}
                  {deadline === '28' && (
                    <div className="breakdown-item" style={{ color: '#aaa', marginTop: '0.25rem' }}>
                      <span>Prazo Estendido 28 Dias (-5%)</span>
                      <strong>{formatCurrency(result.total - (result.total / 0.95))}</strong>
                    </div>
                  )}
                  <div className="breakdown-item" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.5rem', color: 'var(--color-blue)' }}>
                    <span>Custo do Projeto (Sem taxas)</span>
                    <strong>{formatCurrency(result.details.projectCost)}</strong>
                  </div>

                  <div className="breakdown-note">
                    *O Investimento Estimado inclui taxas administrativas Archa (33%) e de agenciamento (25%).
                    <br />
                    *Valores estimados com base na tabela de referência.
                  </div>
                </div>
              </div>

            {/* Architect Profile Selection (Moved) */}
            <div className="form-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
              <label className="section-label">3. Selecione o Perfil do Arquiteto</label>
              <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', opacity: 0.8 }}>
                Escolha a categoria de profissionais para o seu projeto.
              </p>

              <div className="level-list">
                {ARCHITECT_LEVELS.map(level => (
                  <div
                    key={level.id}
                    className={`level-card ${architectLevel === level.id ? 'selected' : ''}`}
                    onClick={() => setArchitectLevel(level.id)}
                  >
                    <div className="level-icon-wrapper" style={{ backgroundColor: architectLevel === level.id ? level.color : '#eee' }}>
                      <span className="level-icon">{level.icon}</span>
                    </div>
                    <div className="level-content">
                      <h5 className="level-title">{level.label}</h5>
                      <p className="level-desc">{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Location Scope Selection */}
              <div className="location-section" style={{ marginTop: '2rem' }}>
                <label className="section-label sub-label">Localidade do profissional:</label>
                <div className="location-options" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Option 1: Brasil */}
                  <div
                    className={`location-card ${locationScope === 'brasil' ? 'selected' : ''}`}
                    onClick={() => setLocationScope('brasil')}
                    style={{
                      padding: '2rem 1.5rem',
                      borderRadius: '16px',
                      border: locationScope === 'brasil' ? '2px solid var(--color-lime)' : '1px solid #e0e0e0',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: '1.5rem',
                      backgroundColor: locationScope === 'brasil' ? 'white' : 'white', // Keep white background, only border changes usually
                      boxShadow: locationScope === 'brasil' ? '0 4px 12px rgba(212, 255, 174, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                      height: '100%'
                    }}
                  >
                    <div className="radio-circle" style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: locationScope === 'brasil' ? '2px solid var(--color-lime)' : '2px solid #ccc',
                      backgroundColor: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {locationScope === 'brasil' && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--color-lime)' }}></div>}
                    </div>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', lineHeight: '1.4' }}>
                      Estou aberto<br />a escritórios<br />de todo Brasil
                    </span>
                  </div>

                  {/* Option 2: Region */}
                  <div
                    className={`location-card ${locationScope === 'region' ? 'selected' : ''}`}
                    onClick={() => setLocationScope('region')}
                    style={{
                      padding: '2rem 1.5rem',
                      borderRadius: '16px',
                      border: locationScope === 'region' ? '2px solid var(--color-lime)' : '1px solid #e0e0e0',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: '1.5rem',
                      backgroundColor: locationScope === 'region' ? 'rgba(212, 255, 174, 0.05)' : 'white',
                      boxShadow: locationScope === 'region' ? '0 4px 12px rgba(212, 255, 174, 0.3)' : '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      height: '100%'
                    }}
                  >
                    <div className="radio-circle" style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: locationScope === 'region' ? '2px solid var(--color-lime)' : '2px solid #ccc',
                      backgroundColor: locationScope === 'region' ? 'var(--color-lime)' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {locationScope === 'region' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-navy)' }}></div>}
                    </div>

                    <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-navy)', lineHeight: '1.4' }}>
                      Quero apenas<br />profissionais<br />da minha região
                    </span>

                    <div className="badge-extra" style={{
                      marginLeft: 'auto',
                      backgroundColor: '#8e44ad',
                      color: 'white',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 6px rgba(142, 68, 173, 0.4)',
                      flexShrink: 0
                    }}>

                      $
                    </div>
                  </div>

                </div>
              </div>

            </div>
            {/* Section 4: Add-ons */}
            <div className="form-section" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
              <label className="section-label">4. O que você deseja para o novo espaço?</label>
              <p style={{ color: 'var(--color-gray-400)', marginBottom: '1rem' }}>
                Selecione os itens que farão parte da sua reforma ou construção.
              </p>

              <div className="addons-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {PROJECT_ADDONS.map(addon => {
                  const Icon = iconMap[addon.icon] || Hammer;
                  const isSelected = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      className={`addon-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedAddons(prev => prev.filter(id => id !== addon.id));
                        } else {
                          setSelectedAddons(prev => [...prev, addon.id]);
                        }
                      }}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid var(--color-lime)' : '1px solid #e0e0e0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        backgroundColor: isSelected ? 'rgba(212, 255, 174, 0.05)' : 'white',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div className="checkbox-box" style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid var(--color-lime)' : '2px solid #ccc',
                        backgroundColor: isSelected ? 'var(--color-lime)' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isSelected && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-navy)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>

                      <div style={{ color: isSelected ? 'var(--color-lime)' : '#aaa', width: '24px', height: '24px' }}>
                        <Icon size={24} />
                      </div>

                      <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-navy)' }}>
                        {addon.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* New Construction Subsection */}
              <div className="new-construction-sub" style={{ marginTop: '2.5rem' }}>
                <label className="section-label sub-label" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>
                  Você planeja construir uma nova área ou renovar fachadas?
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Option Yes */}
                  <div
                    onClick={() => setIsNewConstruction('yes')}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: isNewConstruction === 'yes' ? '2px solid var(--color-lime)' : '1px solid #e0e0e0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      backgroundColor: isNewConstruction === 'yes' ? 'rgba(212, 255, 174, 0.05)' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="radio-circle" style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isNewConstruction === 'yes' ? '6px solid var(--color-lime)' : '2px solid #ccc', // Filled if yes
                      backgroundColor: isNewConstruction === 'yes' ? 'var(--color-navy)' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {/* Inner dot logic if needed, simplify for now */}
                    </div>

                    <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-navy)' }}>
                      Sim, eu planejo construir um novo ambiente
                    </span>
                  </div>

                  {/* Option No */}
                  <div
                    onClick={() => setIsNewConstruction('no')}
                    style={{
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: isNewConstruction === 'no' ? '2px solid var(--color-lime)' : '1px solid #e0e0e0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      backgroundColor: isNewConstruction === 'no' ? 'rgba(212, 255, 174, 0.05)' : 'white',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="radio-circle" style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isNewConstruction === 'no' ? '6px solid var(--color-lime)' : '2px solid #ccc',
                      backgroundColor: isNewConstruction === 'no' ? 'var(--color-navy)' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                    </div>

                    <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-navy)' }}>
                      Não, eu não planejo construir um novo ambiente
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deadline Subsection */}
            <div className="deadline-sub" style={{ marginTop: '2.5rem' }}>
              <label className="section-label sub-label" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'block' }}>
                Em quantos dias você quer receber o seu projeto?
              </label>

              <div className="deadline-grid">
                {/* Option 15 Days */}
                <div
                  onClick={() => setDeadline('15')}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: deadline === '15' ? '2px solid var(--color-lime)' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    backgroundColor: deadline === '15' ? 'rgba(212, 255, 174, 0.05)' : 'white',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}>
                    <div className="radio-circle" style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: deadline === '15' ? '6px solid var(--color-lime)' : '2px solid #ccc',
                      backgroundColor: deadline === '15' ? 'var(--color-navy)' : 'white',
                      display: 'flex',
                      marginRight: '0.5rem'
                    }}></div>
                    <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-navy)' }}>15 dias</span>
                    <div style={{
                      backgroundColor: '#ff4d4d',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      marginLeft: '0.5rem'
                    }}>
                      <TrendingUp size={14} strokeWidth={3} />
                    </div>
                  </div>
                </div>

                {/* Option 21 Days */}
                <div
                  onClick={() => setDeadline('21')}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: deadline === '21' ? '2px solid var(--color-lime)' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    backgroundColor: deadline === '21' ? 'rgba(212, 255, 174, 0.05)' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="radio-circle" style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: deadline === '21' ? '6px solid var(--color-lime)' : '2px solid #ccc',
                    backgroundColor: deadline === '21' ? 'var(--color-navy)' : 'white',
                  }}></div>
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-navy)' }}>21 dias</span>
                </div>

                {/* Option 28 Days */}
                <div
                  onClick={() => setDeadline('28')}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: deadline === '28' ? '2px solid var(--color-lime)' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    backgroundColor: deadline === '28' ? 'rgba(212, 255, 174, 0.05)' : 'white',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="radio-circle" style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: deadline === '28' ? '6px solid var(--color-lime)' : '2px solid #ccc',
                    backgroundColor: deadline === '28' ? 'var(--color-navy)' : 'white',
                  }}></div>
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-navy)' }}>28 dias</span>
                  <div style={{
                    backgroundColor: '#4d79ff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginLeft: '0.5rem'
                  }}>
                    <Percent size={14} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </>
            )}
        </form>

        {/* Result Section (Right Column) */}
        {result && isLeadValid ? (
          <div className="result-section">
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Escolha seu Pacote</h3>

            <div className="packages-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
              {PACKAGES.map(pkg => {
                const pkgValue = result.total * pkg.multiplier;
                const isSelected = selectedPackage === pkg.id;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={`package-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      border: isSelected ? '2px solid var(--color-lime)' : '1px solid transparent',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      background: isSelected ? 'white' : 'rgba(255, 255, 255, 0.9)',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      color: 'var(--color-navy)', // Force dark text
                      marginBottom: '0.5rem'
                    }}
                  >
                    {pkg.recommended && (
                      <div style={{
                        position: 'absolute',
                        top: '-12px',
                        left: '1rem',
                        background: 'var(--color-lime)',
                        color: 'var(--color-navy)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}>
                        Recomendado
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ textTransform: 'uppercase', color: 'var(--color-navy)', margin: 0, fontWeight: 800 }}>{pkg.label}</h4>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-navy)' }}>
                          10x de {formatCurrency(pkgValue / 10)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#555' }}>
                          ou à vista {formatCurrency(pkgValue * 0.85)} (15% OFF)
                        </div>
                      </div>
                      <div className="radio-circle" style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: isSelected ? '6px solid var(--color-lime)' : '2px solid #ccc',
                        backgroundColor: isSelected ? 'var(--color-navy)' : 'white',
                      }}></div>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {pkg.benefits.map((benefit, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#444' }}>
                          <Check size={16} color="var(--color-lime)" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ color: '#333' }}>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="result-header" style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
              <h3>Investimento Total ({PACKAGES.find(p => p.id === selectedPackage).label})</h3>
              <div className="total-value">{formatCurrency(result.total * PACKAGES.find(p => p.id === selectedPackage).multiplier)}</div>
            </div>

            <div className="result-breakdown">
              <div className="breakdown-item">
                <span>Valor base p/ m²</span>
                <strong>{formatCurrency(result.details.valM2)}</strong>
              </div>
              <div className="breakdown-item">
                <span>Valor base p/ ambiente</span>
                <strong>{formatCurrency(result.details.valEnv)}</strong>
              </div>
              <div className="breakdown-item" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <span>Valor Base Total</span>
                <strong>{formatCurrency(result.details.baseTotal)}</strong>
              </div>
              {architectLevel !== 'estreante' && (
                <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.5rem' }}>
                  <span>Perfil {ARCHITECT_LEVELS.find(l => l.id === architectLevel)?.label}</span>
                  <strong>+{Math.round((ARCHITECT_LEVELS.find(l => l.id === architectLevel)?.adjustment || 0) * 100)}%</strong>
                </div>
              )}
              {locationScope === 'region' && (
                <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.25rem' }}>
                  <span>Regional (+10%)</span>
                  <strong>+{formatCurrency(result.total - (result.total / (1 + selectedAddons.reduce((acc, id) => acc + (PROJECT_ADDONS.find(a => a.id === id)?.adjustment || 0), 0)) / 1.10))}</strong>
                </div>
              )}
              {selectedAddons.length > 0 && (
                <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.25rem' }}>
                  <span>Adicionais ({selectedAddons.length})</span>
                  <strong>+{formatCurrency(result.total - (result.total / (1 + selectedAddons.reduce((acc, id) => acc + (PROJECT_ADDONS.find(a => a.id === id)?.adjustment || 0), 0))))}</strong>
                </div>
              )}
              {isNewConstruction === 'yes' && (
                <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.25rem' }}>
                  <span>Nova Área/Fachada (+15%)</span>
                  <strong>+{formatCurrency(result.total - (result.total / 1.15))}</strong>
                </div>
              )}
              {deadline === '15' && (
                <div className="breakdown-item" style={{ color: 'var(--color-lime)', marginTop: '0.25rem' }}>
                  <span>Urgência 15 Dias (+30%)</span>
                  <strong>+{formatCurrency(result.total - (result.total / 1.30))}</strong>
                </div>
              )}
              {deadline === '28' && (
                <div className="breakdown-item" style={{ color: '#aaa', marginTop: '0.25rem' }}>
                  <span>Prazo Estendido 28 Dias (-5%)</span>
                  <strong>{formatCurrency(result.total - (result.total / 0.95))}</strong>
                </div>
              )}
              <div className="breakdown-item" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem', marginTop: '0.5rem', color: 'var(--color-blue)' }}>
                <span>Custo do Projeto (Sem taxas)</span>
                <strong>{formatCurrency(result.details.projectCost)}</strong>
              </div>

              <div className="breakdown-note">
                *O Investimento Estimado inclui taxas administrativas Archa (33%) e de agenciamento (25%).
                <br />
                *Valores estimados com base na tabela de referência.
              </div>
            </div>
          </div>
        ) : (
          <div className="result-section empty-state" style={{
            opacity: 0.8,
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            minHeight: '200px',
            textAlign: 'center',
            border: '2px dashed rgba(255,255,255,0.2)',
            backgroundColor: isLeadValid ? 'var(--color-navy)' : 'var(--color-gray-100)',
            color: isLeadValid ? 'white' : 'var(--color-dark-text)'
          }}>
            <div style={{ padding: '2rem' }}>
              {!metragem || !ambientes ? (
                <p>Preencha os dados do projeto.</p>
              ) : (
                <>
                  <strong style={{ display: 'block', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    Resultado Bloqueado
                  </strong>
                  <p>Complete seu cadastro corretamente para visualizar o investimento.</p>
                </>
              )}
            </div>
          </div>
        )}
    </div>
      </main >
    </div >
  );
}

export default Calculator;
