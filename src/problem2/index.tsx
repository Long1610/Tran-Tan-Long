// CurrencySwapForm.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Select from "react-select";
import { Slide, ToastContainer, toast } from "react-toastify";
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
  fromToken: z
    .string({
      errorMap: () => {
        return { message: "Please select a token to swap from" };
      },
    })
    .min(1),
  toToken: z
    .string({
      errorMap: () => {
        return { message: "Please select a token to swap to" };
      },
    })
    .min(1),
});

type FormData = z.infer<typeof schema>;

type Option = {
  value: string;
  label: JSX.Element;
};

const CurrencySwapForm: React.FC = () => {
  const [tokens, setTokens] = useState<Option[]>([]);
  const [prices, setPrices] = useState<Prices>({});
  const [result, setResult] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
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
        const availableTokens: Option[] = data.map(({ currency }) => {
          const iconUrl = `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`;
          return {
            value: currency,
            label: (
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={iconUrl}
                  alt={currency}
                  style={{ width: 20, height: 20, marginRight: 8 }}
                />
                {currency}
              </div>
            ),
          };
        });

        data.forEach(({ currency, price }) => {
          priceMap[currency] = price;
        });

        setTokens(availableTokens);
        setPrices(priceMap);
      })
      .catch((error) => console.error("Error fetching prices: ", error));
  }, []);

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const { amount, fromToken, toToken } = data;

    if (fromToken === toToken) {
      toast.error("Cannot swap the same token.", {
        position: "top-center",
        transition: Slide,
      });
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
      toast.error("Invalid token prices.", {
        position: "top-center",
        transition: Slide,
      });
    }
  };

  return (
    <>
      <form className="currency-swap-form" onSubmit={handleSubmit(onSubmit)}>
        <h5>Swap</h5>

        <label htmlFor="input-amount">Amount to send</label>
        <input
          id="input-amount"
          type="number"
          placeholder="Enter amount"
          {...register("amount")}
          style={{ marginBottom: errors.amount ? "0px" : "20px" }}
        />
        {errors.amount && <p className="error">{errors.amount.message}</p>}

        <label htmlFor="fromToken">From:</label>
        <Select
          options={tokens}
          onChange={(option) => {
            setValue("fromToken", option?.value || "");
            trigger("fromToken");
          }}
          instanceId="fromToken"
          placeholder="Select Token"
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              marginBottom: errors.fromToken ? "0px" : "20px",
              textAlign: "left",
            }),
          }}
        />
        {errors.fromToken && (
          <p className="error">{errors.fromToken.message}</p>
        )}

        <label htmlFor="toToken">To:</label>
        <Select
          options={tokens}
          onChange={(option) => {
            setValue("toToken", option?.value || "");
            trigger("toToken");
          }}
          instanceId="toToken"
          placeholder="Select Token"
          styles={{
            control: (baseStyles) => ({
              ...baseStyles,
              marginBottom: errors.toToken ? "0px" : "20px",
              textAlign: "left",
            }),
          }}
        />
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
      <ToastContainer />
    </>
  );
};

export default CurrencySwapForm;
