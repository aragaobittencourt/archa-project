import { calculateProjectValue } from './src/utils/calculator.js';

// Base case: 50m2, 3 rooms
// Base Total ~1328
// Fees: * 1.33 * 1.25 = * 1.6625
// Expected Final: 1328 * 1.6625 = 2207.8

const result = calculateProjectValue(50, 3, 0);
console.log('Project Cost:', result.details.projectCost);
console.log('Final Investment:', result.total);
console.log('Expected Investment (~2207):', result.details.projectCost * 1.33 * 1.25);
console.log('Match?', Math.abs(result.total - (result.details.projectCost * 1.33 * 1.25)) < 0.01);
