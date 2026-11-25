/** "A14-101" từ `residence: { buildingCode, roomNumber }` (cấp phòng — không còn số giường) */
export const residenceTextOf = (r) => (r ? `Phòng ${r.buildingCode}-${r.roomNumber}` : null);
