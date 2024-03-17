/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseError, ContractFunctionRevertedError } from "viem";

export const findtokenId = (url: string) => url.split("/").pop()?.split(".")[0];

export const manageError = (err: any) => {
  console.log({ err });
  if (typeof err === "string") {
    alert(err);
  } else if (err instanceof BaseError) {
    const revertError = err.walk(
      (err) => err instanceof ContractFunctionRevertedError
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      alert(revertError.reason);
    } else {
      alert(err.message);
    }
  } else {
    alert(err.message);
  }
};
