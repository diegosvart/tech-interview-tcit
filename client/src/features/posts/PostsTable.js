import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PostsTableRow from './PostsTableRow';
export default function PostsTable({ posts, onDelete, onUpdate, isLoading }) {
    if (isLoading) {
        return (_jsx("div", { className: "table-container", children: _jsx("p", { className: "loading-message", children: "Cargando posts..." }) }));
    }
    if (posts.length === 0) {
        return (_jsx("div", { className: "table-container", children: _jsx("p", { className: "empty-message", children: "No hay posts disponibles" }) }));
    }
    return (_jsx("div", { className: "table-container", children: _jsxs("table", { className: "posts-table", children: [_jsxs("colgroup", { children: [_jsx("col", { style: { width: '25%' } }), _jsx("col", { style: { width: '55%' } }), _jsx("col", { style: { width: '20%' } })] }), _jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nombre" }), _jsx("th", { children: "Descripci\u00F3n" }), _jsx("th", { children: "Acci\u00F3n" })] }) }), _jsx("tbody", { children: posts.map((post) => (_jsx(PostsTableRow, { post: post, onDelete: onDelete || (() => { }), onUpdate: onUpdate || (async () => { }) }, post.id))) })] }) }));
}
