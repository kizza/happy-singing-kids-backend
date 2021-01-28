import { v5 } from "uuid";
import { CustomerPurchase, HydratedCheckoutSession } from ".";
import { lineItemsAsDisplayItems } from "../stripe/price";
import { DisplayItem } from "../stripe/catalogue";
import { apiUrl } from "../util";
import { getFiletype } from "../domain/mp3s";

export const deriveInternalId = (email: string) =>
  v5(email, "a3980a6a-c2f5-4ba1-89eb-335abf31c844");

export const mapCheckoutSessionToPurchase = (
  checkoutSession: HydratedCheckoutSession
): CustomerPurchase => {
  const {
    payment_intent: { id: paymentIntentId, created: createdAt },
    line_items: lineItems,
    customer,
  } = checkoutSession;

  const { id: customerId, email, name } = customer;

  return {
    createdAt,
    customerId,
    internalId: deriveInternalId(email!),
    purchaseId: paymentIntentId,
    email: email || "",
    name: name || "",
    items: lineItemsAsDisplayItems(lineItems.data),
  };
};

export interface LabelItem {
  productId: string;
  name: string;
}

export interface FileItem extends LabelItem {
  url: string;
  filetype: string;
}

export interface Dashboard {
  name: string;
  email: string;
  items: LabelItem[];
  _original: any;
}

export const reducePurchases = (purchases: CustomerPurchase[]) => {
  const initialState: Dashboard = {
    name: "Unknown",
    email: "unknown",
    items: [],
    _original: purchases,
  };

  return purchases.reduce((acc, each) => {
    const { name, email, items } = each;
    const mapItem = ({ productId, name }: DisplayItem) =>
      ({ productId, name } as LabelItem);
    const newItems = [...acc.items, ...items.map(mapItem)];

    return {
      ...acc,
      name,
      email,
      items: newItems,
    } as Dashboard;
  }, initialState);
};

const assignUrl = (token: string) => (item: LabelItem): FileItem => ({
  ...item,
  url: apiUrl(`download/${token}/${item.productId}`),
  filetype: getFiletype(item.productId),
  // url: websiteUrl(`/download/${token}/${item.id}`),
});

export const assignUrls = <T extends { items: (LabelItem | DisplayItem)[] }>(
  token: string
) => (dashboard: T): T => {
  const { items } = dashboard;
  return {
    ...dashboard,
    items: items.map(assignUrl(token)),
  } as T & { items: FileItem[] };
};

export const asDashboard = (token: string) => (purchases: CustomerPurchase[]) =>
  Promise.resolve(reducePurchases(purchases)).then(assignUrls(token));
