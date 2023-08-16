import { Request, Response } from 'express';
import { IdentityQuery } from './query/identityQuery';
import { Contact, ContactResponse } from '../types/common.types';
import { transformContactResponse } from '../lib/helpers';
import { LinkPrecedence } from '../utils/common.enums';

export class IdentityController {
  identityQuery = new IdentityQuery();

  handleContacts = async (req: Request, res: Response) => {
    try {
      const { phoneNumber, email } = req.body;

      if (!phoneNumber && !email) {
        return res.status(400).send({ message: 'Please provide at least a phoneNumber or an email.' });
      }

      const contactsData = await this.fetchContacts(phoneNumber, email);

      if (!contactsData) {
        const primaryContactData = await this.addPrimaryContact(phoneNumber, email);
        return res.status(200).send({ contact: transformContactResponse(primaryContactData) });
      }

      const matchedContacts = await this.checkForMatchingContacts(phoneNumber, email, contactsData);

      if (matchedContacts) {
        return res.status(200).send({ contact: transformContactResponse(matchedContacts) });
      }

      return res.status(200).send({ contact: transformContactResponse(contactsData) });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Failed to Fetch Contacts', error: JSON.stringify(error) });
    }
  };

  private fetchContacts = async (phoneNumber?: string, email?: string): Promise<Contact[] | null> => {
    const { contactsData, error } = await this.identityQuery.getContacts(phoneNumber, email);
    if (error) throw error;

    return contactsData?.length ? contactsData : null;
  };

  private addPrimaryContact = async (phoneNumber: string, email: string): Promise<Contact[]> => {
    const { primaryContactData, error } = await this.identityQuery.addPrimaryContact(phoneNumber, email);
    if (error) throw error;

    return primaryContactData?.length ? primaryContactData : [];
  };

  private checkForMatchingContacts = async (
    phoneNumber: string,
    email: string,
    contactsData: Contact[]
  ): Promise<Contact[] | null> => {
    const matchedByPhoneNumber = contactsData.find(
      (contact) => contact.phone_number === phoneNumber && contact.link_precedence === LinkPrecedence.PRIMARY
    );
    const matchedByEmail = contactsData.find(
      (contact) => contact.email === email && contact.link_precedence === LinkPrecedence.PRIMARY
    );

    if (matchedByPhoneNumber && matchedByEmail && matchedByPhoneNumber.id !== matchedByEmail.id) {
      await this.mergeContacts(matchedByPhoneNumber, matchedByEmail, contactsData);
      return contactsData;
    }

    const partialMatchWithPhoneNumber = contactsData.find((contact) => contact.phone_number === phoneNumber);
    const partialMatchWithEmail = contactsData.find((contact) => contact.email === email);

    const exactMatch = contactsData.some((contact) => contact.phone_number === phoneNumber && contact.email === email);

    if (!exactMatch && ((partialMatchWithPhoneNumber && email) || (partialMatchWithEmail && phoneNumber))) {
      await this.addSecondaryContact(phoneNumber, email, contactsData);
      return contactsData;
    }

    return null;
  };

  private mergeContacts = async (matchedByPhoneNumber: Contact, matchedByEmail: Contact, contactsData: Contact[]) => {
    const olderContact =
      new Date(matchedByPhoneNumber!.created_at) < new Date(matchedByEmail!.created_at)
        ? matchedByPhoneNumber
        : matchedByEmail;
    const newerContact = olderContact.id === matchedByPhoneNumber.id ? matchedByEmail : matchedByPhoneNumber;

    const { secondaryContactData, error } = await this.identityQuery.updateContactToSecondary(
      newerContact.id,
      olderContact.id
    );
    if (error) throw error;

    newerContact.linked_id = olderContact.id;
    newerContact.link_precedence = LinkPrecedence.SECONDARY;

    secondaryContactData && contactsData.push(secondaryContactData[0]);
  };

  private addSecondaryContact = async (phoneNumber: string, email: string, contactsData: Contact[]) => {
    const primaryContact = contactsData.find((contact) => contact.link_precedence === LinkPrecedence.PRIMARY);

    const { secondaryContactData, error } = await this.identityQuery.addSecondaryContact(
      phoneNumber,
      email,
      primaryContact!.id
    );
    if (error) throw error;

    secondaryContactData && contactsData.push(secondaryContactData[0]);
  };
}
