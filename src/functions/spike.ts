import { v5 } from "uuid";
import { persist, query, scan } from "../aws/dynamo";
import { asJson } from "../aws/gateway";
import { CustomerPurchase } from "../models";
// import { encrypt } from "../util";

export const handleQuery = async () => {
  return await query(
    process.env.CUSTOMER_TABLE!,
    "69eca1cc-0dcf-52c6-9a15-99669ec42d02" // internalId
  ).then(response => {
    console.log("Response at end", response);
    return asJson(response);
  });
};

export const handleScan = async () => {
  return await scan(process.env.CUSTOMER_TABLE!).then(response => {
    console.log("Response at end", response);
    return asJson(response);
  });
};

export const handlePut = async () => {
  const email = "keiran.oleary@gmail.com";
  return await persist(process.env.CUSTOMER_TABLE!, {
    // id: "fooasdf",
    internalId: v5(email, "a3980a6a-c2f5-4ba1-89eb-335abf31c844"),
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
    purchaseId: "purchase id 1",
    customerId: "customer id",
    name: "Keiran",
    last: "O'Leary",
    email: email,
    items: [
      {
        priceId: "li_1GvrUYFbHwwHDg3DjM7MY2hu",
        productId: "prod_HOdRq4x692ERsA",
        // name: "Another song",
        name: "Grumplestiltskin",
        amount: 100,
        currency: "aud",
      },
      {
        priceId: "li_1GvrUYFbHwwHDg3DjM7MY2hu",
        productId: "prod_HRh1JWoeQ6Etnj",
        name: "Bumma Mummy",
        amount: 200,
        currency: "aud",
      },
    ],
  } as CustomerPurchase).then(response => {
    console.log("Response at end", response);
    return asJson(response);
  });
};
