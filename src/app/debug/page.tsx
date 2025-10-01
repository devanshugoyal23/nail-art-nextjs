import { getGalleryItems } from '@/lib/galleryService';

export default async function DebugPage() {
  try {
    const items = await getGalleryItems();
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Database Debug</h1>
        <p className="mb-4">Total items: {items.length}</p>
        
        {items.length > 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">Sample Items:</h2>
            <div className="space-y-2">
              {items.slice(0, 5).map((item) => (
                <div key={item.id} className="border p-2 rounded">
                  <p><strong>ID:</strong> {item.id}</p>
                  <p><strong>Design Name:</strong> {item.design_name || 'N/A'}</p>
                  <p><strong>Category:</strong> {item.category || 'N/A'}</p>
                  <p><strong>Created:</strong> {item.created_at}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-red-500">No items found in database</p>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Database Error</h1>
        <p className="text-red-500">Error: {String(error)}</p>
      </div>
    );
  }
}
