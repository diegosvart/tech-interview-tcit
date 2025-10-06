import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Route, Routes } from 'react-router-dom';
import PostsList from './features/posts/PostsList';
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(PostsList, {}) }), _jsx(Route, { path: "/posts", element: _jsx(PostsList, {}) })] }));
}
