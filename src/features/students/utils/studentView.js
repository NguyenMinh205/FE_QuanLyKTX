/** "K1-101 · Giường 03" từ `residence: { buildingCode, roomNumber, bedNumber }` (API.md §3) */
export const residenceTextOf = (r) => (r ? `${r.buildingCode}-${r.roomNumber} · Giường ${String(r.bedNumber).padStart(2, '0')}` : null);
