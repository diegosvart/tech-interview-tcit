import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function FilterHeader({ filter, onFilterChange, currentPage, pageSize, totalPages, onPageChange, onPageSizeChange }) {
    const handleChange = (e) => {
        onFilterChange(e.target.value);
    };
    const handlePageSizeChange = (e) => {
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
    return (_jsx("div", { className: "filter-header", children: _jsxs("div", { className: "filter-container", children: [_jsxs("div", { className: "filter-search-group", children: [_jsx("input", { type: "text", className: "filter-input", placeholder: "Filtro de Nombre", value: filter, onChange: handleChange }), _jsx("button", { type: "button", className: "btn-search", children: "Buscar" })] }), _jsxs("div", { className: "pagination-controls", children: [_jsx("button", { className: "btn-pagination", onClick: handlePrevPage, disabled: currentPage <= 1, title: "P\u00E1gina anterior", children: "\u25C0" }), _jsxs("span", { className: "pagination-info", children: ["P\u00E1g. ", currentPage, " de ", totalPages || 1] }), _jsx("button", { className: "btn-pagination", onClick: handleNextPage, disabled: currentPage >= totalPages, title: "P\u00E1gina siguiente", children: "\u25B6" }), _jsxs("select", { className: "page-size-select", value: pageSize, onChange: handlePageSizeChange, title: "Registros por p\u00E1gina", children: [_jsx("option", { value: 5, children: "5" }), _jsx("option", { value: 10, children: "10" }), _jsx("option", { value: 20, children: "20" }), _jsx("option", { value: 50, children: "50" })] })] })] }) }));
}
