// CurrencySwapForm.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import "./CurrencySwapForm.css";

type PriceData = {
  currency: string;
  price: number;
};

type Prices = { [key: string]: number };

const schema = z.object({
  amount: z
    .string()
    .regex(
      /^\d+(\.\d{1,6})?$/,
      "Amount must be a valid number with up to 6 decimal places"
    )
    .transform((val) => parseFloat(val))
    .refine((val) => val > 0, "Amount must be greater than 0"),
  fromToken: z.string().min(1, "Please select a token to swap from"),
  toToken: z.string().min(1, "Please select a token to swap to"),
});

type FormData = z.infer<typeof schema>;

const CurrencySwapForm: React.FC = () => {
  const [tokens, setTokens] = useState<string[]>([]);
  const [prices, setPrices] = useState<Prices>({});
  const [result, setResult] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    axios
      .get("https://interview.switcheo.com/prices.json")
      .then((response) => {
        const data: PriceData[] = response.data;
        const priceMap: Prices = {};
        const availableTokens: string[] = [];

        data.forEach(({ currency, price }) => {
          priceMap[currency] = price;
          availableTokens.push(currency);
        });

        setTokens(availableTokens);
        setPrices(priceMap);
      })
      .catch((error) => console.error("Error fetching prices: ", error));
  }, []);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const { amount, fromToken, toToken } = data;

    if (fromToken === toToken) {
      alert("Cannot swap the same token.");
      return;
    }

    const fromPrice = prices[fromToken];
    const toPrice = prices[toToken];

    if (fromPrice && toPrice) {
      setIsLoading(true);

      setTimeout(() => {
        const exchangeRate = fromPrice / toPrice;
        setResult(amount * exchangeRate);
        setIsLoading(false);
      }, 1500);
    } else {
      alert("Invalid token prices.");
    }
  };

  return (
    <form className="currency-swap-form" onSubmit={handleSubmit(onSubmit)}>
      <h5>Swap</h5>

      <label htmlFor="input-amount">Amount to send</label>
      <input
        id="input-amount"
        type="number"
        placeholder="Enter amount"
        {...register("amount")}
      />
      {errors.amount && <p className="error">{errors.amount.message}</p>}

      <label htmlFor="fromToken">From:</label>
      <select id="fromToken" {...register("fromToken")}>
        <option value="">Select Token</option>
        {tokens.map((token) => (
          <option key={token} value={token}>
            {token}
          </option>
        ))}
      </select>
      {errors.fromToken && <p className="error">{errors.fromToken.message}</p>}

      <label htmlFor="toToken">To:</label>
      <select id="toToken" {...register("toToken")}>
        <option value="">Select Token</option>
        {tokens.map((token) => (
          <option key={token} value={token}>
            {token}
          </option>
        ))}
      </select>
      {errors.toToken && <p className="error">{errors.toToken.message}</p>}

      <label htmlFor="output-amount">Amount to receive</label>
      <input
        id="output-amount"
        type="text"
        value={result > 0 ? result.toFixed(6) : ""}
        readOnly
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Processing..." : "CONFIRM SWAP"}
      </button>
    </form>
  );
};

export default CurrencySwapForm;
