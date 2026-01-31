"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
} from "lucide-react"

export function DownloadHistoryTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(10)
  const totalPages = 6

  const downloads: { game: string; carClass: string; car: string; year: string; week: string; lapTime: string }[] = []

  return (
    <div className="mt-8">
      {/* Search and Pagination Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Search Input */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full sm:w-64 pl-10 rounded-full bg-[#151515] border-white/10 text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:border-white/30"
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {[1, 2].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-9 w-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                currentPage === page
                  ? "bg-primary text-white"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {page}
            </button>
          ))}
          <span className="text-white/40 px-1">...</span>
          <button
            onClick={() => setCurrentPage(totalPages)}
            className={`h-9 w-9 flex items-center justify-center rounded-full text-sm font-medium transition-all ${
              currentPage === totalPages
                ? "bg-primary text-white"
                : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {totalPages}
          </button>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 ml-4">
            <span className="text-white/60 text-sm">Entries Per Page</span>
            <div className="relative">
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="h-9 w-16 pl-3 pr-8 rounded-full bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Game
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Week
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Lap Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {downloads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-white/50 text-sm">
                    No data available in table
                  </td>
                </tr>
              ) : (
                downloads.map((dl, index) => (
                  <tr
                    key={index}
                    className={`border-b border-white/5 ${
                      index % 2 === 0 ? "bg-transparent" : "bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-white/80">{dl.game}</td>
                    <td className="px-6 py-4 text-sm text-white/80">{dl.carClass}</td>
                    <td className="px-6 py-4 text-sm text-white/80">{dl.car}</td>
                    <td className="px-6 py-4 text-sm text-white/80">{dl.year}</td>
                    <td className="px-6 py-4 text-sm text-white/80">{dl.week}</td>
                    <td className="px-6 py-4 text-sm text-white/80 font-mono">{dl.lapTime}</td>
                    <td className="px-6 py-4">
                      <button className="h-9 px-5 rounded-full text-xs font-semibold bg-brand-gradient text-white hover:brightness-110">
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
