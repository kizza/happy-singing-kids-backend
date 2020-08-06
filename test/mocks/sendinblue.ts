import * as _email from "../../src/sendinblue";
import { EmailProps } from "../../src/sendinblue";

export const mockEmail = (fn: (email: string, props: EmailProps) => any) =>
  jest.spyOn(_email, "sendEmail").mockImplementation(fn);
