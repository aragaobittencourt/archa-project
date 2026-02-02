export const calculateProjectValue = (metragem, ambientes, projectTypeAdj, levelAdj = 0, locationAdj = 0, addonsAdj = 0, newConstructionAdj = 0, deadlineAdj = 0, archaRate = 0.33, finderRate = 0.25) => {
    // Ensure inputs are numbers
    const m2 = Number(metragem) || 0;
    const envs = Number(ambientes) || 0;
    const adj = Number(projectTypeAdj) || 0;
    const lvl = Number(levelAdj) || 0;
    const loc = Number(locationAdj) || 0;

    const add = Number(addonsAdj) || 0;
    const newConst = Number(newConstructionAdj) || 0;
    const deadline = Number(deadlineAdj) || 0;

    // Valor total por m2 = MAX(3; 5*EXP(-0,0005 * [#metragem]))
    const valM2Raw = 5 * Math.exp(-0.0005 * m2);
    const valM2 = Math.max(3, valM2Raw);

    // Valor total por ambiente = MAX(200; 488*EXP(-0,1* #ambientes ))
    const valEnvRaw = 488 * Math.exp(-0.1 * envs);
    const valEnv = Math.max(200, valEnvRaw);

    // O valor do projeto é #metragem*Valor total por m2 + Valor total por ambiente*#ambientes.
    const baseTotal = (m2 * valM2) + (valEnv * envs);

    // Add adjustments
    // Final = (Base * (1 + TypeAdj)) * (1 + LevelAdj) * (1 + LocationAdj) * (1 + AddonsAdj) * (1 + NewConstructionAdj)
    const projectAdjustedTotal = baseTotal * (1 + adj);
    const levelAdjustedTotal = projectAdjustedTotal * (1 + lvl);
    const locationAdjustedTotal = levelAdjustedTotal * (1 + loc);
    const addonsAdjustedTotal = locationAdjustedTotal * (1 + add);
    const newConstAdjustedTotal = addonsAdjustedTotal * (1 + newConst);
    const finalTotal = newConstAdjustedTotal * (1 + deadline);
    const projectCost = finalTotal;

    // Fees
    // Archa Fee (Dynamic)
    // Finder's Fee (Dynamic)
    // Total Investment = ProjectCost * (1 + ArchaFee) * (1 + FindersFee)

    const ARCHA_RATE = Number(archaRate);
    const FINDER_RATE = Number(finderRate);

    const withArcha = projectCost * (1 + ARCHA_RATE);
    const finalInvestment = withArcha * (1 + FINDER_RATE);

    return {
        total: finalInvestment, // Main Big Number
        details: {
            valM2,
            valEnv,
            baseTotal,
            projectCost // The pre-fee total
        }
    };
};

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};
