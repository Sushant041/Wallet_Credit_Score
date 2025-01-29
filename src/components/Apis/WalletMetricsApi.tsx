import axios from 'axios';

interface metricsValue {
  unit: string;
  value: number;
}

interface metricsResponse {
  metric_values: {
    transactions?: metricsValue;
    volume?: metricsValue;
    portfolioValue?: metricsValue;
  };
}


export const fetchWalletMetrics = async (
  blockchain: number,
  walletAddress: string,
  currency: string,
  metrics: string,
  Api: string,
): Promise<metricsResponse> => {
  const url = `https://api.unleashnfts.com/api/v1/wallet/${walletAddress}/metrics`;
  try {
    const response = await axios.get(url, {
      params: {
        blockchain,
        currency,
        metrics:  metrics === 'portfolioValue' ? 'portfolio_value' : metrics,
        time_range: "all",
        include_washtrade: true,
      },
      headers: {
        accept: 'application/json',
        'x-api-key': Api,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || 'Failed to fetch wallet metrics'
    );
  }
};
