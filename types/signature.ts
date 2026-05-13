export type SignatureFormState = {
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  whatsapp: string;
};

export const emptySignatureForm: SignatureFormState = {
  fullName: "",
  jobTitle: "",
  phone: "",
  email: "",
  whatsapp: "",
};
