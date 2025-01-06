// Implementation A: Using a for loop
const sum_to_n_a = (n: number): number => {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Implementation B: Using the formula for the sum of the first n natural numbers
const sum_to_n_b = (n: number): number => {
  return (n * (n + 1)) / 2;
};

// Implementation C: Using recursion
const sum_to_n_c = (n: number): number => {
  if (n === 1) return 1; // Base case
  return n + sum_to_n_c(n - 1); // Recursive case
};

console.log(sum_to_n_a(5));
console.log(sum_to_n_b(5));
console.log(sum_to_n_c(5));
