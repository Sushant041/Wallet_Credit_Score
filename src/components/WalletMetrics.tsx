import React, { useState, useEffect } from "react";
import { fetchWalletMetrics } from "./Apis/WalletMetricsApi.tsx";

interface MetricsValue {
  unit: string;
  value: number;
}

interface WalletData {
  [key: string]: MetricsValue;
}

interface WalletMetricsProps {
  setTransactions: (transactions: number) => void;
  setVolume: (volume: number) => void;
  setPortfolioValue: (portfolioValue: number) => void;
  walletAddress: string;
  chainId: number;
  getRandomApiKey : () => string;
}

// Assuming this is how the response structure looks
interface MetricResponse {
  metric_values: {
    [key: string]: MetricsValue;
  };
}

const WalletMetrics: React.FC<WalletMetricsProps> = ({
  setTransactions,
  setVolume,
  setPortfolioValue,
  walletAddress,
  chainId,
  getRandomApiKey
}) => {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const metricsOptions: string[] = ["transactions", "volume", "portfolioValue"];

  // Function to introduce a delay between API calls
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    let isCancelled = false; // To handle component unmounting safely

    const fetchMetricsSequentially = async () => {
      setLoading(true);
      setError(null);
      const fetchedData: WalletData = {};

      try {
        for (const metric of metricsOptions) {
          console.log(`Fetching ${metric} for wallet`, walletAddress);

          // Fetch one metric at a time
          const response = (await fetchWalletMetrics(
            chainId,
            walletAddress,
            "usd",
            metric === "portfolioValue" ? "portfolio_value" : metric,
            getRandomApiKey(),
          )) as MetricResponse;

          if (isCancelled) return; // Stop if component unmounts

          const metricKey =
            metric === "portfolioValue" ? "portfolio_value" : metric;
          fetchedData[metric] = response?.metric_values[metricKey];

          // Update state accordingly
          switch (metric) {
            case "transactions":
              setTransactions(
                response?.metric_values?.transactions?.value ?? 0
              );
              break;
            case "volume":
              setVolume(response?.metric_values?.volume?.value ?? 0);
              break;
            case "portfolioValue":
              setPortfolioValue(
                response?.metric_values?.portfolio_value?.value ?? 0
              );
              break;
          }

          // Introduce a delay before the next request (e.g., 1 second)
          await delay(1000);
        }

        if (!isCancelled) {
          setData(fetchedData);
        }
      } catch (err: any) {
        console.log(err);
        if (!isCancelled) {
          setError(err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchMetricsSequentially();

    return () => {
      isCancelled = true; // Prevent updates if component unmounts
    };
  }, [walletAddress, chainId]);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-32">
        <h1 className="text-4xl font-semibold mb-6 text-center text-blue-400">
          Wallet Metrics
        </h1>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-400"></div>
      </div>
    );

  if (error)
    return (
      <div className="text-red-400 text-center mt-4">
        <h1 className="text-4xl font-semibold mb-6 text-center text-blue-400">
          Wallet Metrics
        </h1>
        {error.status === 429
          ? "Failed to load Wallet token data due to server load, please refresh again to load."
          : error.status === 404 ?
          "Wallet not found" : error.message
          }
      </div>
    );

  return (
    <div className="bg-gray-900 text-gray-200 border-2 border-zinc-700 p-6 rounded-lg shadow-lg mt-6">
      <h1 className="text-4xl font-semibold mb-6 text-center text-blue-400">
        Wallet Metrics
      </h1>

      {data && (
        <ul className="space-y-4">
          {Object.entries(data).map(([metricName, metric]) => (
            <li
              key={metricName}
              className="flex justify-between items-center bg-gray-800 p-4 rounded-lg shadow-md"
            >
              <span className="font-medium text-gray-300">
                {metricName?.replace(/_/g, " ")}:
              </span>
              <span className="text-lg text-white font-semibold">
                {metric?.value} {metric?.unit || ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default WalletMetrics;
