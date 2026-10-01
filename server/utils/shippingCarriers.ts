export const CARRIER_NAMES = ["پست پیشتاز", "تیپاکس", "چاپار"] as const;

export const carrierWhere = { name: { in: [...CARRIER_NAMES] } };

export const activeCarrierWhere = { ...carrierWhere, isActive: true };
