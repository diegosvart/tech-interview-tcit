import { Post } from './posts.api';
import PostsTableRow from './PostsTableRow';

interface PostsTableProps {
  posts: Post[];
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, name: string, description: string) => Promise<void>;
  isLoading?: boolean;
}

export default function PostsTable({ posts, onDelete, onUpdate, isLoading }: PostsTableProps) {
  if (isLoading) {
    return (
      <div className="table-container">
        <p className="loading-message">Cargando posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="table-container">
        <p className="empty-message">No hay posts disponibles</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="posts-table">
        <colgroup>
          <col style={{ width: '25%' }} />
          <col style={{ width: '55%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <PostsTableRow
              key={post.id}
              post={post}
              onDelete={onDelete || (() => {})}
              onUpdate={onUpdate || (async () => {})}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
