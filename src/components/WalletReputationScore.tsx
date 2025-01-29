import React, { useEffect, useState } from "react";
import axios from "axios";

interface WalletMetric {
  value: string;
  unit: string;
}

interface WalletData {
  wallet: {
    metric_values: {
      [key: string]: WalletMetric;
    };
  };
}

interface WalletReputationScoreProps {
  setWalletAgeScore: (walletAgeScore: number) => void;
  setRiskInteractionScore: (riskInteractionScore: number) => void;
  setSmartContractInteractionScore: (
    smartContractInteractionScore: number
  ) => void;
  setWalletScore: (walletScore: number) => void;
  walletAddress: string;
  chainId: number;
  getRandomApiKey: () => string;
}


const WalletReputationScore: React.FC<WalletReputationScoreProps> = ({
  setWalletAgeScore,
  setRiskInteractionScore,
  setSmartContractInteractionScore,
  setWalletScore,
  walletAddress,
  chainId,
  getRandomApiKey,
}) => {
  const [metrics, setMetrics] = useState<{
    [key: string]: WalletMetric;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const API_URL = `https://api.unleashnfts.com/api/v1/wallet/${chainId}/${walletAddress}/score/reputation`;

  // Function to introduce a delay between API calls
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const fetchMetric = async (metric: string): Promise<WalletData> => {
    try {
      const response = await axios.get(`${API_URL}?metrics=${metric}`, {
        headers: {
          accept: "application/json",
          "x-api-key": getRandomApiKey(),
        },
      });
      return response.data;
    } catch (error: any) {
      console.log(error);
      throw new Error(
        `${error.status === 404 ?
          "Wallet not found" : error.message}`
      );
    }
  };

  useEffect(() => {
    let isCancelled = false; // To handle component unmounting safely

    const fetchMetricsSequentially = async () => {
      setLoading(true);
      setError(null);

      const metricsToFetch = [
        "wallet_score",
        "wallet_age_score",
        "risk_interaction_score",
        "smart_contract_interaction_score",
      ];

      const newMetrics: { [key: string]: WalletMetric } = {};

      try {
        for (const metric of metricsToFetch) {
          console.log(`Fetching ${metric} for wallet`, walletAddress);

          const result = await fetchMetric(metric);
          if (isCancelled) return;

          const metricValue = result.wallet.metric_values[metric];
          newMetrics[metric] = metricValue;

          // Update individual states
          switch (metric) {
            case "wallet_score":
              setWalletScore(Number(metricValue?.value || 0));
              break;
            case "wallet_age_score":
              setWalletAgeScore(Number(metricValue?.value || 0));
              break;
            case "risk_interaction_score":
              setRiskInteractionScore(Number(metricValue?.value || 0));
              break;
            case "smart_contract_interaction_score":
              setSmartContractInteractionScore(Number(metricValue?.value || 0));
              break;
          }

          // Introduce a delay before the next request
          await delay(1000);
        }

        if (!isCancelled) {
          setMetrics(newMetrics);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err
          );
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchMetricsSequentially();

    return () => {
      isCancelled = true; // Stop execution if the component unmounts
    };
  }, [walletAddress, chainId]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center gap-4 items-center h-32">
        <h1 className="text-xl font-semibold text-center text-blue-400">
        Wallet Reputation Score
      </h1>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-200"></div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="text-red-400 text-center mt-4">
        <h1 className="text-4xl font-semibold mb-4 text-center text-blue-400">
          Wallet Reputation Score
        </h1>
        {error.status === 429
          ? "Failed to load Wallet token data due to server load, please refresh again to load."
          : error.status === 404 ?
          "Wallet not found" : error.message
          }
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border-2 border-zinc-700 text-gray-200 p-6 rounded-lg shadow-md mt-4">
      <h1 className="text-4xl font-semibold mb-4 text-center text-blue-400">
        Wallet Reputation Score
      </h1>
      {metrics ? (
        <ul className="space-y-2">
          {Object.entries(metrics).map(([metricName, metric]) => (
            <li
              key={metricName}
              className="flex justify-between bg-gray-800 p-3 rounded-lg shadow-sm"
            >
              <span className="font-medium">
                {metricName.replace(/_/g, " ")}:
              </span>
              <span>
                {metric.value} {metric.unit}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-400">No metrics available.</div>
      )}
    </div>
  );
};

export default WalletReputationScore;
