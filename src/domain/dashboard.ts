import { query } from "../aws/dynamo";
import { CustomerPurchase } from "../models";
import { reducePurchases, assignUrls, Dashboard } from "../models/domain";

const allDashboard: Dashboard = {
  name: "All",
  email: "all@email.com",
  items: [
    {
      productId: "prod_HOdRq4x692ERsA",
      name: "Grumplestiltskin",
    },
    {
      productId: "prod_HRh1JWoeQ6Etnj",
      name: "Bummer mummy",
    },
    {
      productId: "prod_HRgyCTMF0a5tUo",
      name: "Butterfly flaps its wings",
    },
    {
      productId: "prod_HmVUV2SprbAo9h",
      name: "Lullaby Angel",
    },
    {
      productId: "prod_HmVVaM78OF7B35",
      name: "The Wind",
    },
    {
      productId: "prod_HmVVnVWod9t63R",
      name: "Go to bed",
    },
    {
      productId: "prod_HmVWh5V6yJyCBE",
      name: "Greetings song",
    },
    {
      productId: "prod_HOdRUkZgB5CFmH",
      name: "Uh oh spaghetti oh",
    },
    {
      productId: "prod_HmVWh5V6yJyCAG",
      name: "Happy Singing Kids.zip",
    },
  ],
  _original: undefined,
};

const fixedDashboards: Record<string, Dashboard> = {
  share: allDashboard,
};

export const retrieveDashboard = (token: string) =>
  Promise.resolve(fixedDashboards[token] || loadDashboard(token)).then(
    assignUrls(token)
  );

const loadDashboard = (token: string) =>
  query(process.env.CUSTOMER_TABLE!, token)
    .then(response => response.Items as CustomerPurchase[])
    .then(reducePurchases);
