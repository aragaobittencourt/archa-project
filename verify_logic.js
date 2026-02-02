import { calculateProjectValue } from './src/utils/calculator.js';

// Base case: 50m2, 3 rooms, Residential (0), Level (0), Location (0), Addons (0), NewConst (0)
// Base Total should be around 1328.39
const base = calculateProjectValue(50, 3, 0).total;
console.log('Base (21 days/0%):', base);

// 15 Days (+30%)
const rush = calculateProjectValue(50, 3, 0, 0, 0, 0, 0, 0.30).total;
console.log('Rush (15 days/+30%):', rush);
console.log('Expected Rush:', base * 1.30);
console.log('Match?', Math.abs(rush - (base * 1.30)) < 0.01);

// 28 Days (-5%)
const discount = calculateProjectValue(50, 3, 0, 0, 0, 0, 0, -0.05).total;
console.log('Discount (28 days/-5%):', discount);
console.log('Expected Discount:', base * 0.95);
console.log('Match?', Math.abs(discount - (base * 0.95)) < 0.01);
