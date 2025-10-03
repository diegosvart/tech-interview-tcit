import { ChangeEvent } from 'react';

interface FilterHeaderProps {
  filter: string;
  onFilterChange: (value: string) => void;
  // Paginación
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function FilterHeader({ 
  filter, 
  onFilterChange,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange
}: FilterHeaderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFilterChange(e.target.value);
  };

  const handlePageSizeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="filter-header">
      <div className="filter-container">
        {/* Filtro de búsqueda */}
        <div className="filter-search-group">
          <input
            type="text"
            className="filter-input"
            placeholder="Filtro de Nombre"
            value={filter}
            onChange={handleChange}
          />
          <button type="button" className="btn-search">
            Buscar
          </button>
        </div>

        {/* Controles de paginación */}
        <div className="pagination-controls">
          <button 
            className="btn-pagination"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            title="Página anterior"
          >
            ◀
          </button>
          
          <span className="pagination-info">
            Pág. {currentPage} de {totalPages || 1}
          </span>
          
          <button 
            className="btn-pagination"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            title="Página siguiente"
          >
            ▶
          </button>
          
          <select 
            className="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            title="Registros por página"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
