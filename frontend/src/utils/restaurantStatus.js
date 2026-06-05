const HEARTBEAT_MS = 30000;

/** Whether the restaurant is accepting orders right now. */
export function isRestaurantLive(restaurant) {
  if (restaurant?.isLive != null) return restaurant.isLive;
  if (!restaurant?.isOpen) return false;
  if (!restaurant?.lastActiveAt) return false;
  return Date.now() - new Date(restaurant.lastActiveAt).getTime() < HEARTBEAT_MS;
}

/** UI badge: Closed | Offline | null (open & live) */
export function getRestaurantStatusLabel(restaurant) {
  if (!restaurant?.isOpen) return "Closed";
  if (!isRestaurantLive(restaurant)) return "Offline";
  return null;
}
