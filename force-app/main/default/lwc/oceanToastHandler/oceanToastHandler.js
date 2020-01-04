import { ShowToastEvent } from "lightning/platformShowToastEvent";

/**
 * Shows a batch toast of all error messages in an error object
 * @param {object} errorObj - Error object when a record insert fails.
 */

const showErrorToast = errorObj => {
  let messages = [];
  let sMessages = "";
  if (errorObj.body && errorObj.body.output && errorObj.body.output.fieldErrors) {
    const errorFields = errorObj.body.output.fieldErrors;
    Object.keys(errorFields).forEach(f => {
      messages.push(errorFields[f][0].message);
    });
    sMessages = messages.join("\n");
  }
  const event = new ShowToastEvent({
    title:  errorObj.body ? errorObj.body.message : "Error",
    message: sMessages,
    variant: "error",
    mode: "dismissable"
  });
  return event;
};

export { showErrorToast };
