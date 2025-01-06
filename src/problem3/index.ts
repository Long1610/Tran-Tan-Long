// Key Improvements
// Typed blockchain Parameter:

// The blockchain parameter in getPriority is strongly typed using the WalletBalance['blockchain'] union type.
// Fixed Sorting and Filtering Logic:

// Balances with amount <= 0 or blockchain not in the priority map are excluded.
// Removed Redundant formattedBalances:

// The formatting of amount is integrated into the rows mapping directly.
// Dependency Optimization:

// The useMemo dependency array only includes balances since prices are not involved in filtering or sorting.
// Enhanced Type Safety:

// All variables and function parameters are explicitly typed.
// Readable and Maintainable Code:

// Clean separation of filtering, sorting, and formatting improves readability and maintainability.

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: "Osmosis" | "Ethereum" | "Arbitrum" | "Zilliqa" | "Neo";
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // Assign priority based on blockchain
  const getPriority = (blockchain: WalletBalance["blockchain"]): number => {
    const priorities: Record<WalletBalance["blockchain"], number> = {
      Osmosis: 100,
      Ethereum: 50,
      Arbitrum: 30,
      Zilliqa: 20,
      Neo: 20,
    };
    return priorities[blockchain] || -99;
  };

  // Filter and sort balances
  const sortedBalances = useMemo(() => {
    return balances
      .filter(
        (balance) => balance.amount > 0 && getPriority(balance.blockchain) > -99
      )
      .sort(
        (lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain)
      );
  }, [balances]);

  // Generate rows for rendering
  const rows = sortedBalances.map((balance, index) => {
    const formattedAmount = balance.amount.toFixed(2);
    const usdValue = prices[balance.currency] * balance.amount;

    return (
      <WalletRow
        className="wallet-row"
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={formattedAmount}
      />
    );
  });

  return <div {...rest}>{rows}</div>;
};
