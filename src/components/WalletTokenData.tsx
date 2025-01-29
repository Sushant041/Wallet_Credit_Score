import React, { useEffect, useState } from "react";
import { useTable, useSortBy, Column } from "react-table";
import { fetchWalletTokenData } from "./Apis/WalletTockenApi"; // Adjust the path as needed

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

interface WalletTokenDataProps {
  setNumTokensHeld: (numTokensHeld: number) => void;
  walletAddress: string;
  chainId: number;
  getRandomApiKey: () => string
}

const WalletTokenData: React.FC<WalletTokenDataProps> = ({
  setNumTokensHeld,
  walletAddress,
  chainId,
  getRandomApiKey
}) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 10; // Number of tokens per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const offset = (currentPage - 1) * itemsPerPage;
        const response: ApiResponse = await fetchWalletTokenData(
          chainId, // Blockchain ID (e.g., Ethereum)
          walletAddress,
          offset,
          itemsPerPage,
          getRandomApiKey(),
        );

        setNumTokensHeld(response.token.length);
        setTokens(response.token);
        setTotalPages(
          Math.ceil(response.pagination.total_items / itemsPerPage)
        );
      } catch (error: any) {
        console.log(error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [walletAddress, setNumTokensHeld, currentPage, chainId]);

  // Define React Table columns
  const columns: Column<Token>[] = React.useMemo(
    () => [
      {
        Header: "Token Name",
        accessor: "token_name",
      },
      {
        Header: "Symbol",
        accessor: "token_symbol",
      },
      {
        Header: "Quantity",
        accessor: (token: any) =>
          (token.quantity / Math.pow(10, token.decimal)).toLocaleString(),
        id: "quantity",
      },
      {
        Header: "Decimal",
        accessor: "decimal",
      },
      {
        Header: "Address",
        accessor: "token_address",
        Cell: ({ value }: { value: string }) => (
          <a
            href={`https://etherscan.io/token/${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {value.slice(0, 6)}...{value.slice(-4)}
          </a>
        ),
      },
    ],
    []
  );

  // Initialize React Table
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable(
      {
        columns,
        data: tokens,
      },
      useSortBy // Enable sorting
    );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-32">
        <h1 className="text-4xl font-semibold mb-4 text-center text-blue-400">
        Wallet Token Data
      </h1>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-200"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center mt-4">
        <h1 className="text-4xl font-semibold mb-4 text-center text-blue-400">
          Wallet Token Data
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
        Wallet Token Data
      </h1>

      {/* Token Table */}
      <div className="overflow-x-auto">
        <table
          {...getTableProps()}
          className="table-auto w-full border-collapse text-sm"
        >
          <thead>
            {headerGroups.map((headerGroup: any) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="bg-gray-800 text-gray-300"
              >
                {headerGroup.headers.map((column: any) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="px-4 py-2 border-b border-gray-700 text-left cursor-pointer"
                  >
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row: any) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className="hover:bg-gray-700 transition-colors duration-150"
                >
                  {row.cells.map((cell: any) => (
                    <td
                      {...cell.getCellProps()}
                      className="px-4 py-2 border-b border-gray-800"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded bg-gray-700 ${
            currentPage === 1
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-600"
          }`}
        >
          Previous
        </button>

        <span className="text-gray-400">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded bg-gray-700 ${
            currentPage === totalPages
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-gray-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WalletTokenData;
