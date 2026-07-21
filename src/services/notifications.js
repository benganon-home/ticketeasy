import { getMyPurchases, getMySales } from './transactions';
import { getMyListings } from './listings';
import { getConversations } from './messages';

function millis(v) {
  if (v?.toMillis) return v.toMillis();
  return typeof v === 'number' ? v : 0;
}

// Derive a real notification feed from the user's own data. No separate
// notifications collection — these are computed from transactions, listings
// and conversations, so they always reflect current state.
export async function getNotifications(uid) {
  const [purchases, sales, listings, convos] = await Promise.all([
    getMyPurchases(uid).catch(() => []),
    getMySales(uid).catch(() => []),
    getMyListings(uid).catch(() => []),
    getConversations(uid).catch(() => []),
  ]);

  const items = [];

  for (const t of purchases) {
    const at = millis(t.updatedAt || t.createdAt);
    if (t.status === 'paid') items.push({ id: `p-${t.id}`, type: 'purchase', title: 'הכרטיס מוכן לחשיפה', subtitle: t.eventTitle, to: `/reveal/${t.id}`, at });
    else if (t.status === 'revealed') items.push({ id: `p-${t.id}`, type: 'purchase', title: 'אשר קבלת כרטיס', subtitle: t.eventTitle, to: `/reveal/${t.id}`, at });
    else if (t.status === 'disputed') items.push({ id: `p-${t.id}`, type: 'dispute', title: 'המחלוקת שלך בטיפול', subtitle: t.eventTitle, to: `/reveal/${t.id}`, at });
  }

  for (const t of sales) {
    const at = millis(t.updatedAt || t.createdAt);
    if (t.status === 'paid' || t.status === 'revealed') items.push({ id: `s-${t.id}`, type: 'sale', title: 'הכרטיס שלך נמכר', subtitle: `${t.eventTitle || ''} · בהמתנה לשחרור`, to: '/profile', at });
    else if (t.status === 'released') items.push({ id: `s-${t.id}`, type: 'sale', title: 'התשלום שוחרר אליך', subtitle: t.eventTitle, to: '/profile', at });
  }

  for (const l of listings) {
    if (l.status === 'sold') items.push({ id: `l-${l.id}`, type: 'sale', title: 'המודעה שלך נמכרה', subtitle: l.eventTitle, to: `/listing/${l.id}`, at: millis(l.updatedAt || l.createdAt) });
  }

  for (const c of convos) {
    if (c.lastSenderId && c.lastSenderId !== uid) {
      items.push({ id: `c-${c.id}`, type: 'message', title: 'הודעה חדשה', subtitle: c.lastMessage || '', to: '/messages', at: millis(c.lastMessageAt) });
    }
  }

  return items.sort((a, b) => b.at - a.at);
}
