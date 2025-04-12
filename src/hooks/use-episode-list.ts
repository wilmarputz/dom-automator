import { useState, useMemo } from 'react';
import { Episode } from '@/components/dashboard/EpisodeCard';

type SortField = 'title' | 'createdAt' | 'moduleCount';
type SortOrder = 'asc' | 'desc';

interface UseEpisodeListProps {
  episodes: Episode[];
  itemsPerPage?: number;
}

interface EpisodeFilters {
  search?: string;
  moduleCount?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export function useEpisodeList({ episodes, itemsPerPage = 9 }: UseEpisodeListProps) {
  const [filters, setFilters] = useState<EpisodeFilters>({});
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters
  const filteredEpisodes = useMemo(() => {
    return episodes.filter(episode => {
      // Search filter
      if (filters.search && !episode.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Module count filter
      if (filters.moduleCount !== undefined && episode.moduleCount !== filters.moduleCount) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const episodeDate = new Date(episode.createdAt);
        if (episodeDate < filters.dateRange.start || episodeDate > filters.dateRange.end) {
          return false;
        }
      }

      return true;
    });
  }, [episodes, filters]);

  // Apply sorting
  const sortedEpisodes = useMemo(() => {
    return [...filteredEpisodes].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'moduleCount':
          comparison = a.moduleCount - b.moduleCount;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredEpisodes, sortField, sortOrder]);

  // Apply pagination
  const totalPages = Math.ceil(sortedEpisodes.length / itemsPerPage);
  const paginatedEpisodes = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedEpisodes.slice(start, end);
  }, [sortedEpisodes, currentPage, itemsPerPage]);

  // Update filters
  const updateFilters = (newFilters: Partial<EpisodeFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Update sort
  const updateSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return {
    episodes: paginatedEpisodes,
    filters,
    updateFilters,
    sortField,
    sortOrder,
    updateSort,
    pagination: {
      currentPage,
      totalPages,
      setCurrentPage,
    },
    totalItems: filteredEpisodes.length,
  };
}