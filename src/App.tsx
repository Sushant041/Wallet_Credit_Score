import React, { useEffect, useState } from "react";
import axios from "axios";
import DeFiPortfolio from "./components/DefiPortfolio";
import WalletTokenData from "./components/WalletTokenData";
import WalletMetrics from "./components/WalletMetrics";
import WalletReputationScore from "./components/WalletReputationScore";

const MAX_CREDIT_SCORE = 1.0;

const API_KEYS = [
  "cbe32ab2a4ce0186852a6a5299b214fd",
  "df51d1d20cd88215009bea3b1861cf4d",
  "61f5fbfd94427f02344462dfafec30ec"
]

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [walletAddressprop, setWalletAddressProp] = useState<string>("");
  const [chainId, setChainId] = useState<number>(1);
  const [chainIdprop, setChainIdProp] = useState<number>(1);
  const [portfolioData, setPortfolioData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [transactions, setTransactions] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);
  const [numTokensHeld, setNumTokensHeld] = useState<number>(0);
  const [walletAgeScore, setWalletAgeScore] = useState<number>(0);
  const [riskInteractionScore, setRiskInteractionScore] = useState<number>(0);
  const [smartContractInteractionScore, setSmartContractInteractionScore] =
    useState<number>(0);
  const [walletScore, setWalletScore] = useState<number>(0);

  const creditScore = React.useMemo(() => {
    // Apply ceiling to observed maximums for safety
    const CEIL_PORTFOLIO_VALUE = 2000; // Original max: 1771.82
    const CEIL_TRANSACTIONS = 1500; // Original max: 1278
    const CEIL_VOLUME = 2000000000; // Original max: 1,995,632,500
    const CEIL_NUM_TOKENS = 1000; // Already safe (matches observed max)
  
    // Normalize metrics with ceiling values
    const normalizedPortfolioValue = Math.min(
      (portfolioValue || 0) / CEIL_PORTFOLIO_VALUE,
      1
    );
    const normalizedNumTokensHeld = Math.min(
      (numTokensHeld || 0) / CEIL_NUM_TOKENS,
      1
    );
    const normalizedTransactions = Math.min(
      (transactions || 0) / CEIL_TRANSACTIONS,
      1
    );
    const normalizedVolume = Math.min((volume || 0) / CEIL_VOLUME, 1);
    const normalizedWalletAgeScore = (walletAgeScore || 0) / 10; // Max 10
    const normalizedRiskScore = 1 - (riskInteractionScore || 0) / 25; // Inverted
    const normalizedSmartContractScore = (smartContractInteractionScore || 0) / 100; // Max 100
    const normalizedWalletScore = (walletScore || 0) / 100; // Max 100
  
    // Weighted formula (weights sum to 1)
    return (
      0.2 * normalizedPortfolioValue +
      0.1 * normalizedNumTokensHeld +
      0.1 * normalizedTransactions +
      0.2 * normalizedVolume +
      0.1 * normalizedWalletAgeScore +
      0.1 * normalizedRiskScore +
      0.1 * normalizedSmartContractScore +
      0.1 * normalizedWalletScore
    );
  }, [
    portfolioValue,
    numTokensHeld,
    transactions,
    volume,
    walletAgeScore,
    riskInteractionScore,
    smartContractInteractionScore,
    walletScore,
  ]);

  const percentageScore = (creditScore / MAX_CREDIT_SCORE) * 100;

  const rank = React.useMemo(() => {
    if (percentageScore >= 90) return "🌟 Excellent (Tier 1)";
    if (percentageScore >= 75) return "✅ Good (Tier 2)";
    if (percentageScore >= 50) return "⚠️ Average (Tier 3)";
    if (percentageScore >= 25) return "❌ Below Average (Tier 4)";
    return "🔴 Poor (Tier 5)";
  }, [percentageScore]);

  const getRandomApiKey = () => {
    return API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
  };

  const fetchPortfolioData = async () => {
    
    if (!walletAddress) {
      setError("Please enter a wallet address.");
      return;
    }
    if (walletAddress === walletAddressprop && chainId === chainIdprop) {
      return;
    }
    setWalletAddressProp(walletAddress);
    setChainIdProp(chainId);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "https://api.unleashnfts.com/api/v1/wallet/balance/defi",
        {
          params: {
            blockchain: chainId,
            address: walletAddress,
            limit: 30,
            offset: 0,
            "x-api-key": getRandomApiKey(),
          },
          headers: {
            Authorization: getRandomApiKey(),
          },
        }
      );
      setPortfolioData(response.data);
    } catch (error: any) {
      setPortfolioData(null);
      setError(
        error.response?.data?.message || error.message || "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 w-full min-h-screen text-gray-200 pt-20">
      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-800 p-4 shadow-md z-50 flex justify-between items-center">
        <div className="text-3xl font-bold text-blue-400">
          Crypto Credit Score
        </div>
        {walletAddress && (
          <div className="text-lg bg-gray-700 px-4 py-1 rounded-md">
            Wallet:{" "}
            <span className="text-blue-300">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        )}
      </nav>

      <div className="px-6 mb-6">
        {/* Form to enter wallet and blockchain */}
        <div className="bg-gray-800 mt-[40px] md:mt-3 p-6 rounded-lg shadow-md mb-6 md:w-2/3 mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Enter Wallet Address and Blockchain
          </h2>
          <div className="flex flex-col md:flex-row gap-4 overflow-auto">
            <input
              type="text"
              className="p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none flex-grow"
              placeholder="Enter Wallet Address"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
            <select
              className="p-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none"
              value={chainId}
              onChange={(e) => setChainId(Number(e.target.value))}
            >
              <option value={1}>Ethereum (1)</option>
              <option value={56}>Binance Smart Chain (56)</option>
              <option value={137}>Polygon (137)</option>
              <option value={900}>Solana (900)</option>
              <option value={8086}>Bitcoin (8086)</option>
            </select>
            <button
              disabled={loading}
              onClick={fetchPortfolioData}
              className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              Calculate Score
            </button>
          </div>
        </div>

        {walletAddressprop && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <div className="p-4 bg-gray-800 rounded-lg shadow-md">
                  <h2 className="text-4xl font-semibold mb-2 text-blue-400">
                    Credit Score
                  </h2>
                  <div className="text-2xl font-bold text-green-500">
                    {creditScore.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-400">
                    Max Score: {MAX_CREDIT_SCORE.toFixed(2)}
                  </p>

                  {/* Credit Score Meter */}
                  <div className="mt-4">
                    <div className="relative w-full bg-gray-700 rounded-full h-5 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-5 rounded-full"
                        style={{
                          width: `${percentageScore}%`,
                          background:
                            percentageScore >= 75
                              ? "green"
                              : percentageScore >= 50
                              ? "yellow"
                              : "red",
                          transition: "width 0.5s ease-in-out",
                        }}
                      ></div>
                    </div>
                    {/* Percentage Display */}
                    <p
                      style={{
                        color:
                          percentageScore >= 75
                            ? "green"
                            : percentageScore >= 50
                            ? "yellow"
                            : "red",
                        transition: "width 0.5s ease-in-out",
                      }}
                      className="text-center text-lg text-gray-300 font-semibold mt-2"
                    >
                      {percentageScore.toFixed(2)}%
                    </p>
                  </div>

                  <h2 className="text-lg font-semibold mt-4">Rank</h2>
                  <div className="text-xl font-bold">{rank}</div>
                </div>

                <WalletReputationScore
                  chainId={chainIdprop}
                  getRandomApiKey={getRandomApiKey}
                  walletAddress={walletAddressprop}
                  setWalletAgeScore={setWalletAgeScore}
                  setRiskInteractionScore={setRiskInteractionScore}
                  setSmartContractInteractionScore={
                    setSmartContractInteractionScore
                  }
                  setWalletScore={setWalletScore}
                />
                
              </div>

              <div className="lg:col-span-3 space-y-6">
              <WalletMetrics
                  chainId={chainIdprop}
                  getRandomApiKey={getRandomApiKey}
                  walletAddress={walletAddressprop}
                  setPortfolioValue={setPortfolioValue}
                  setTransactions={setTransactions}
                  setVolume={setVolume}
                />

                {loading && (
                  <div className="flex flex-col justify-center items-center h-32">
                    <h1 className="text-4xl font-semibold mb-4 text-center text-blue-400">
                  Defi Portfolio Data
                </h1>
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-200"></div>
                  </div>
                )}
               
                {error && (
                  <div className="text-red-400 text-center mb-4">
                    <h1 className="text-4xl font-semibold mb-4 text-center text-blue-400">
                  Defi Portfolio Data
                </h1>
                    Defi Portfolio data for Wallet not Available
                  </div>
                )}

                {portfolioData && !loading && (
                  <DeFiPortfolio portfolioData={portfolioData} />
                )}
                <WalletTokenData
                  getRandomApiKey={getRandomApiKey}
                  chainId={chainIdprop}
                  walletAddress={walletAddressprop}
                  setNumTokensHeld={setNumTokensHeld}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
