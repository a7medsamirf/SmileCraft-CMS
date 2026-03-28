import { InventoryItem, InventoryTransaction, InventoryAlert, StockStatus } from "../types";

const INVENTORY_STORAGE_KEY = "dental_inventory_data";
const TRANSACTIONS_STORAGE_KEY = "dental_inventory_transactions";
const ALERTS_STORAGE_KEY = "dental_inventory_alerts";

const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: "1",
    name: "Lidocaine 2% with Epinephrine",
    category: "ANESTHETICS",
    quantity: 25,
    minQuantity: 10,
    unitPrice: 45,
    unit: "carpule",
    supplier: "Dental Supply Co.",
    expiryDate: "2027-06-15",
    batchNumber: "LID-2024-001",
    location: "Cabinet A-1",
  },
  {
    id: "2",
    name: "Composite Resin - A2 Shade",
    category: "MATERIALS",
    quantity: 8,
    minQuantity: 5,
    unitPrice: 350,
    unit: "syringe",
    supplier: "3M Dental",
    expiryDate: "2026-12-01",
    batchNumber: "COMP-A2-2024",
    location: "Cabinet B-2",
  },
  {
    id: "3",
    name: "Sterilization Pouches (Large)",
    category: "STERILIZATION",
    quantity: 150,
    minQuantity: 50,
    unitPrice: 2,
    unit: "piece",
    supplier: "MediPack",
    location: "Storage Room",
  },
  {
    id: "4",
    name: "Extraction Forceps #151",
    category: "INSTRUMENTS",
    quantity: 3,
    minQuantity: 2,
    unitPrice: 850,
    unit: "piece",
    supplier: "Hu-Friedy",
    location: "Instrument Tray 1",
  },
  {
    id: "5",
    name: "Surgical Sutures 3-0 Silk",
    category: "MATERIALS",
    quantity: 4,
    minQuantity: 10,
    unitPrice: 25,
    unit: "pack",
    supplier: "Ethicon",
    expiryDate: "2028-03-20",
    batchNumber: "SILK-3-0-2024",
    location: "Cabinet B-1",
  },
];

export const inventoryService = {
  getAllItems: (): InventoryItem[] => {
    if (typeof window === "undefined") return MOCK_INVENTORY;
    const stored = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : MOCK_INVENTORY;
  },

  getItemById: (id: string): InventoryItem | undefined => {
    const items = inventoryService.getAllItems();
    return items.find((item) => item.id === id);
  },

  getItemsByCategory: (category: string): InventoryItem[] => {
    const items = inventoryService.getAllItems();
    return category === "ALL" ? items : items.filter((item) => item.category === category);
  },

  saveItem: (item: InventoryItem): void => {
    const items = inventoryService.getAllItems();
    const index = items.findIndex((i) => i.id === item.id);

    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }

    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
    inventoryService.checkAlerts(item);
  },

  deleteItem: (id: string): void => {
    const items = inventoryService.getAllItems();
    const filtered = items.filter((i) => i.id !== id);
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(filtered));
  },

  updateQuantity: (id: string, quantityChange: number, reason: string, type: "IN" | "OUT"): void => {
    const item = inventoryService.getItemById(id);
    if (!item) return;

    item.quantity = Math.max(0, item.quantity + quantityChange);
    item.lastRestocked = type === "IN" ? new Date().toISOString() : item.lastRestocked;
    inventoryService.saveItem(item);

    // Record transaction
    const transactions = inventoryService.getTransactions();
    transactions.push({
      id: crypto.randomUUID(),
      itemId: id,
      type,
      quantity: Math.abs(quantityChange),
      reason,
      date: new Date().toISOString(),
      performedBy: "current_user", // In real app, get from auth context
    });
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  },

  getStockStatus: (item: InventoryItem): StockStatus => {
    if (item.expiryDate && new Date(item.expiryDate) < new Date()) {
      return "EXPIRED";
    }
    if (item.quantity === 0) {
      return "OUT_OF_STOCK";
    }
    if (item.quantity <= item.minQuantity) {
      return "LOW_STOCK";
    }
    return "IN_STOCK";
  },

  // Alerts
  checkAlerts: (item?: InventoryItem): void => {
    const items = item ? [item] : inventoryService.getAllItems();
    const existingAlerts = inventoryService.getAlerts();
    const newAlerts: InventoryAlert[] = [];

    items.forEach((i) => {
      const status = inventoryService.getStockStatus(i);

      if (status === "LOW_STOCK") {
        newAlerts.push({
          id: crypto.randomUUID(),
          itemId: i.id,
          itemName: i.name,
          type: "LOW_STOCK",
          message: `Low stock: ${i.name} (${i.quantity} ${i.unit} remaining)`,
          createdAt: new Date().toISOString(),
          acknowledged: false,
        });
      } else if (status === "OUT_OF_STOCK") {
        newAlerts.push({
          id: crypto.randomUUID(),
          itemId: i.id,
          itemName: i.name,
          type: "OUT_OF_STOCK",
          message: `Out of stock: ${i.name}`,
          createdAt: new Date().toISOString(),
          acknowledged: false,
        });
      }

      // Check expiry (30 days warning)
      if (i.expiryDate) {
        const expiryDate = new Date(i.expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        if (expiryDate < thirtyDaysFromNow && expiryDate > new Date()) {
          newAlerts.push({
            id: crypto.randomUUID(),
            itemId: i.id,
            itemName: i.name,
            type: "EXPIRING_SOON",
            message: `Expiring soon: ${i.name} (expires ${expiryDate.toLocaleDateString()})`,
            createdAt: new Date().toISOString(),
            acknowledged: false,
          });
        } else if (expiryDate < new Date()) {
          newAlerts.push({
            id: crypto.randomUUID(),
            itemId: i.id,
            itemName: i.name,
            type: "EXPIRED",
            message: `Expired: ${i.name} (expired ${expiryDate.toLocaleDateString()})`,
            createdAt: new Date().toISOString(),
            acknowledged: false,
          });
        }
      }
    });

    // Merge with existing unacknowledged alerts
    const unacknowledged = existingAlerts.filter((a) => !a.acknowledged);
    const allAlerts = [...unacknowledged, ...newAlerts];
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(allAlerts));
  },

  getAlerts: (): InventoryAlert[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  acknowledgeAlert: (alertId: string): void => {
    const alerts = inventoryService.getAlerts();
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    }
  },

  clearAcknowledgedAlerts: (): void => {
    const alerts = inventoryService.getAlerts();
    const unacknowledged = alerts.filter((a) => !a.acknowledged);
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(unacknowledged));
  },

  // Transactions
  getTransactions: (): InventoryTransaction[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getTransactionsByItem: (itemId: string): InventoryTransaction[] => {
    const transactions = inventoryService.getTransactions();
    return transactions.filter((t) => t.itemId === itemId);
  },

  // Reports
  getInventoryValue: (): number => {
    const items = inventoryService.getAllItems();
    return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  },

  getLowStockItems: (): InventoryItem[] => {
    const items = inventoryService.getAllItems();
    return items.filter((item) => item.quantity <= item.minQuantity);
  },

  getExpiringItems: (days: number = 30): InventoryItem[] => {
    const items = inventoryService.getAllItems();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return items.filter((item) => {
      if (!item.expiryDate) return false;
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= futureDate && expiryDate > new Date();
    });
  },
};
