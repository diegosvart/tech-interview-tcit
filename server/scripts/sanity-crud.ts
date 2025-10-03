import 'dotenv/config';

async function main() {
  const base = `http://localhost:${process.env.PORT ?? 3000}/api/v1`;
  const headers = { 'Content-Type': 'application/json' } as const;

  // Create
  const createdRes = await fetch(`${base}/posts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'sanity-crud', description: 'tmp' }),
  });
  if (!createdRes.ok) throw new Error(`Create failed: ${createdRes.status}`);
  const created = await createdRes.json();
  console.log('CREATE OK', created.id);

  // Get
  const getRes = await fetch(`${base}/posts/${created.id}`);
  if (!getRes.ok) throw new Error(`Get failed: ${getRes.status}`);
  const got = await getRes.json();
  console.log('GET OK', got.name);

  // Update
  const updateRes = await fetch(`${base}/posts/${created.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ name: 'sanity-crud-updated', description: null }),
  });
  if (!updateRes.ok) throw new Error(`Update failed: ${updateRes.status}`);
  const updated = await updateRes.json();
  console.log('UPDATE OK', updated.name);

  // Delete
  const deleteRes = await fetch(`${base}/posts/${created.id}`, { method: 'DELETE' });
  if (deleteRes.status !== 204) throw new Error(`Delete failed: ${deleteRes.status}`);
  console.log('DELETE OK');

  // Confirm 404
  const get404 = await fetch(`${base}/posts/${created.id}`);
  if (get404.status !== 404) throw new Error(`Expected 404, got ${get404.status}`);
  console.log('404 OK');
}

main().catch((e) => {
  console.error('[SANITY-CRUD] Error:', e);
  process.exit(1);
});
