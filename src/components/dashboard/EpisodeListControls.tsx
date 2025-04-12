import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, SortAsc, SortDesc } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EpisodeListControlsProps {
  onSearchChange: (search: string) => void;
  onSortChange: (field: string) => void;
  onDateRangeChange: (range: { start: Date; end: Date } | undefined) => void;
  onPageChange: (page: number) => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function EpisodeListControls({
  onSearchChange,
  onSortChange,
  onDateRangeChange,
  onPageChange,
  sortField,
  sortOrder,
  currentPage,
  totalPages,
  totalItems,
}: EpisodeListControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Buscar episódios..."
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Sort */}
        <div className="flex gap-2">
          <Select
            value={sortField}
            onValueChange={onSortChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Título</SelectItem>
              <SelectItem value="createdAt">Data de criação</SelectItem>
              <SelectItem value="moduleCount">Número de módulos</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onSortChange(sortField)}
          >
            {sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px]">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Filtrar por data
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              locale={ptBR}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange({ start: range.from, end: range.to });
                } else {
                  onDateRangeChange(undefined);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {Math.min(totalItems, 9)} de {totalItems} episódios
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm">
            Página {currentPage} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}