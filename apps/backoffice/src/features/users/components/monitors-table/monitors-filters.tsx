"use client"

import { DownloadIcon, SearchIcon, SlidersHorizontalIcon2 } from "@/lib/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User } from "@prisma/client"
import { VisibleColumns } from "@/app/(post-auth)/dashboard/monitors/monitors"

interface MonitorsFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  visibleColumns: VisibleColumns
  toggleColumn: (column: keyof VisibleColumns) => void
  monitors: User[]
}

export function MonitorsFilters({
  searchTerm,
  setSearchTerm,
  visibleColumns,
  toggleColumn,
  monitors,
}: MonitorsFiltersProps) {
  // Function to export monitors data as CSV
  const exportToCSV = () => {
    // Define CSV headers
    const headers = [
      "Nom",
      "Email",
      "Id",
      "Role",
    ].join(",")

    // Convert each customer to CSV row
    const csvRows = monitors.map((monitor) => {
      const values = [
        `"${monitor.name}"`,
        `"${monitor.email}"`,
        `"${monitor.id}"`,
        `"${monitor.role}"`
      ]
      return values.join(",")
    })

    // Combine headers and rows
    const csvContent = [headers, ...csvRows].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `clients_export_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div className="relative w-full sm:w-96">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email, téléphone, ville, pays..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <SlidersHorizontalIcon2 className="mr-2 h-4 w-4" />
              Colonnes
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem checked={visibleColumns.id} onCheckedChange={() => toggleColumn("id")}>
              Id
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={visibleColumns.name} onCheckedChange={() => toggleColumn("name")}>
              Nom
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={visibleColumns.email} onCheckedChange={() => toggleColumn("email")}>
              Email
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={visibleColumns.role} onCheckedChange={() => toggleColumn("role")}>
              Role
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="sm" className="h-9" onClick={exportToCSV}>
          <DownloadIcon className="mr-2 h-4 w-4" />
          Exporter
        </Button>
      </div>
    </div>
  )
}
