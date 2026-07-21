import { ref, uploadBytes } from 'firebase/storage';
import { storage, auth } from '../firebase';

// Upload a ticket file to the user's write-once, no-read upload prefix.
// Returns the storage path for the OCR / publish functions to read server-side.
export async function uploadTicketFile(file) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('יש להתחבר.');
  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const path = `ticket-uploads/${uid}/${Date.now()}-${safeName}`;
  await uploadBytes(ref(storage, path), file, { contentType: file.type || 'application/octet-stream' });
  return path;
}
