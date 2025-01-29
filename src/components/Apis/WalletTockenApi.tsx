import axios from "axios";

type Token = {
  blockchain: string;
  chain_id: number;
  decimal: number;
  quantity: number;
  token_address: string;
  token_name: string;
  token_symbol: string;
};

type Pagination = {
  total_items: number;
  offset: number;
  limit: number;
  has_next: boolean;
};

type ApiResponse = {
  token: Token[];
  pagination: Pagination;
};
// API function to fetch wallet token data
export const fetchWalletTokenData = async (
  blockchain: number,
  address: string,
  offset: number = 0,
  limit: number = 30,
  Api: string,
): Promise<ApiResponse> => {
  const url = `https://api.unleashnfts.com/api/v1/wallet/balance/token`;
  try {
    const response = await axios.get<ApiResponse>(url, {
      params: { blockchain, address, offset, limit },
      headers: {
        accept: "application/json",
        "x-api-key": Api,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch wallet token data"
    );
  }
};
