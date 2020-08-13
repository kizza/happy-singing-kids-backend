import { query } from "../aws/dynamo";
import { CustomerPurchase } from "../models";
import {
  reducePurchases,
  assignUrls,
  Dashboard,
  LabelItem,
} from "../models/domain";
import { inventory, HAPPY_PACK_1 } from "./inventory";
import { pipeFail } from "../aws/gateway";

const allDashboard: Dashboard = {
  name: "All",
  email: "all@email.com",
  items: [{ productId: HAPPY_PACK_1, name: "Happy Pack 1" }],
  _original: undefined,
};

const fixedDashboards: Record<string, Dashboard> = {
  share: allDashboard,
};

export const fanOutPacks = (dashboard: Dashboard) => {
  const isAPack = (item: LabelItem) => item.productId === HAPPY_PACK_1;

  const fanOut = (acc: LabelItem[], item: LabelItem) =>
    isAPack(item) ? [...acc, ...inventory[item.productId]] : [...acc, item];

  const fannedOut = {
    ...dashboard,
    items: dashboard.items.reduce(fanOut, []),
  };

  return fannedOut;
};

export const filterDuplicates = (dashboard: Dashboard) => {
  const exists = (items: LabelItem[], find: LabelItem) =>
    !!items.find(each => each.productId === find.productId);

  const filtered = {
    ...dashboard,
    items: dashboard.items.reduce(
      (acc, each) => (exists(acc, each) ? acc : [...acc, each]),
      [] as LabelItem[]
    ),
  };

  return filtered;
};

export const retrieveDashboard = (token: string) =>
  Promise.resolve(fixedDashboards[token] || loadDashboard(token))
    .then(fanOutPacks)
    .then(filterDuplicates)
    .then(assignUrls(token));

const loadDashboard = (token: string) =>
  query(process.env.CUSTOMER_TABLE!, token)
    .then(response => response.Items as CustomerPurchase[])
    .then(purchases => {
      if (purchases.length === 0) {
        throw pipeFail(404, `Could not load dashboard ${token}`);
      }
      return purchases;
    })
    .then(reducePurchases);
