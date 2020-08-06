import { persist, richQuery } from "./aws/dynamo";
import { CustomerPurchase, HydratedCheckoutSession } from "./models";
import {
  mapCheckoutSessionToPurchase,
  deriveInternalId,
} from "./models/domain";
import { EmailProps, sendEmail } from "./sendinblue";
import { retrieveCheckoutSession } from "./stripe/sessions";

const getCheckoutSession = (checkoutSessionId: string) =>
  retrieveCheckoutSession(checkoutSessionId);

const returnExistingOrNew = (checkoutSession: HydratedCheckoutSession) => (
  purchase?: CustomerPurchase
) => {
  const newOne = Promise.resolve(mapCheckoutSessionToPurchase(checkoutSession))
    .then(sendThankyouEmail)
    .then(persistCheckoutSession);

  return purchase || newOne;
};

const lookupExistingPurchase = async (internalId: string, purchaseId: string) =>
  richQuery(
    process.env.CUSTOMER_TABLE!,
    "internalId = :internalId AND purchaseId = :purchaseId",
    {
      ":internalId": internalId,
      ":purchaseId": purchaseId,
    }
  ).then(response => {
    if (response.Items && response.Items.length > 0) {
      console.log("Returning existing persisted purchase");
      return response.Items[0] as CustomerPurchase;
    } else {
      console.log("No existing purchase. Continuing fullfillment");
    }
  });

const checkIfAlreadyFullfilled = async (
  checkoutSession: HydratedCheckoutSession
) => {
  const {
    payment_intent: { id: paymentIntentId },
    customer: { email },
  } = checkoutSession;

  return lookupExistingPurchase(deriveInternalId(email!), paymentIntentId);
};

const persistCheckoutSession = (entry: CustomerPurchase) =>
  persist(process.env.CUSTOMER_TABLE!, entry);

const sendThankyouEmail = async (purchase: CustomerPurchase) => {
  const { email, items, internalId } = purchase;
  const emailProps: EmailProps = {
    items,
    primaryLink: `https://happysingingkids.com/songs/${internalId}`,
  };

  return sendEmail(email, emailProps).then(() => purchase);
};

export const fullfillCheckoutSession = async (
  checkoutSessionId: string
): Promise<CustomerPurchase> =>
  getCheckoutSession(checkoutSessionId).then(session =>
    checkIfAlreadyFullfilled(session).then(returnExistingOrNew(session))
  );
