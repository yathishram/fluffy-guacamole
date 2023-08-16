import { Contact, ContactResponse } from '../types/common.types';

export const transformContactResponse = (contacts: Contact[]): ContactResponse | null => {

  const primaryContact = contacts.find((contact) => contact.link_precedence === 'primary');

  if (!primaryContact) return null;

  const secondaryContacts = contacts.filter((contact) => contact.link_precedence === 'secondary');

  const emails = Array.from(new Set([
    primaryContact.email,
    ...secondaryContacts.map((contact) => contact.email),
  ]));

  const phoneNumbers = Array.from(new Set([
    primaryContact.phone_number,
    ...secondaryContacts.map((contact) => contact.phone_number),
  ]));

  const secondaryContactIds = secondaryContacts.map((contact) => contact.id);

  const contactResponse: ContactResponse = {
    primaryContatctId: primaryContact.id,
    emails: emails as string[],
    phoneNumbers: phoneNumbers as string[],
    secondaryContactIds: secondaryContactIds as number[],
  };

  return contactResponse;
};

