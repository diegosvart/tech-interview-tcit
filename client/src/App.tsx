import { Route, Routes } from 'react-router-dom';

import PostsList from './features/posts/PostsList';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PostsList />} />
      <Route path="/posts" element={<PostsList />} />
    </Routes>
  );
}
