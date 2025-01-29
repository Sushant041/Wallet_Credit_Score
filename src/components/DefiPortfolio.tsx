import React, { useState } from "react";
import { useTable } from "react-table";

type Position = {
  blockchain: string;
  chain_id: number;
  decimal: number;
  quantity: string;
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

type PortfolioData = {
  walletAddress: string;
  active_positions: Position[];
  pagination: Pagination;
};

type DeFiPortfolioProps = {
  portfolioData: PortfolioData;
};

const DeFiPortfolio: React.FC<DeFiPortfolioProps> = ({ portfolioData }) => {
  if (!portfolioData || !portfolioData.active_positions) {
    return <div className="text-gray-300 text-center mt-10">No data available.</div>;
  }

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return portfolioData.active_positions.slice(startIndex, startIndex + itemsPerPage).map((position) => ({
      tokenName: position.token_name,
      tokenSymbol: position.token_symbol,
      quantity: Number(position.quantity).toLocaleString(),
      tokenAddress: position.token_address,
      blockchain: position.blockchain,
      decimal: position.decimal,
    }));
  }, [portfolioData, currentPage]);

  const columns = React.useMemo(
    () => [
      { Header: "Token Name", accessor: "tokenName" },
      { Header: "Token Symbol", accessor: "tokenSymbol" },
      { Header: "Quantity", accessor: "quantity" },
      {
        Header: "Token Address",
        accessor: "tokenAddress",
        Cell: ({ value }: { value: string }) => (
          <a
            href={`https://etherscan.io/token/${value}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {value.slice(0, 6)}...{value.slice(-4)}
          </a>
        ),
      },
      { Header: "Blockchain", accessor: "blockchain" },
      { Header: "Decimal", accessor: "decimal" },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data: paginatedData });

  const totalPages = Math.ceil(portfolioData.active_positions.length / itemsPerPage);

  return (
    <div className="bg-gray-900 text-white border-2 border-zinc-700 p-6 rounded-lg shadow-md">
      <h1 className="text-4xl font-semibold mb-4 text-center text-blue-400">
                  Defi Portfolio Data
                </h1>
      <div className="overflow-x-auto">
        <table {...getTableProps()} className="w-full text-left table-auto border-collapse">
          <thead className="bg-gray-800">
            {headerGroups.map((headerGroup:any) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column:any) => (
                  <th {...column.getHeaderProps()} className="px-4 py-2 border-b border-gray-700">
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row:any) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-700 transition duration-200">
                  {row.cells.map((cell:any) => (
                    <td {...cell.getCellProps()} className="px-4 py-2 border-b border-gray-700">
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
          className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600`}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default DeFiPortfolio;
