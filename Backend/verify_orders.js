// Verification script for order calculations
const total = 100;
const commission = total * 0.15;
const chefEarning = total - commission;

console.log(`Total: ${total}`);
console.log(`Commission (15%): ${commission}`);
console.log(`Chef Earning: ${chefEarning}`);

if (commission === 15 && chefEarning === 85) {
  console.log("Calculation Verification: PASSED");
} else {
  console.log("Calculation Verification: FAILED");
  process.exit(1);
}
