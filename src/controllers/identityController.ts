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

        // Get the contacts from the database
        const { contactsData, error } = await this.identityQuery.getContacts(phoneNumber, email);

        console.log(contactsData)
        if (error) throw error;

        // If no contacts are found, add a primary contact
        if (!contactsData?.length) {
            const { primaryContactData, error } = await this.identityQuery.addPrimaryContact(phoneNumber, email);
            if (error) throw error;
            return res.status(200).send({ contact: transformContactResponse(primaryContactData as Contact[]) });
        }

        const matchedByPhoneNumber = contactsData.find(contact => contact.phone_number === phoneNumber && contact.link_precedence === LinkPrecedence.PRIMARY);
        const matchedByEmail = contactsData.find(contact => contact.email === email && contact.link_precedence === LinkPrecedence.PRIMARY);

        if (matchedByPhoneNumber && matchedByEmail && matchedByPhoneNumber.id !== matchedByEmail.id) {
            const olderContact = (new Date(matchedByPhoneNumber.createdAt) < new Date(matchedByEmail.createdAt)) ? matchedByPhoneNumber : matchedByEmail;
            const newerContact = olderContact.id === matchedByPhoneNumber.id ? matchedByEmail : matchedByPhoneNumber;

            // Turn newer contact to secondary and link to the older contact
            const {secondaryContactData , error} = await this.identityQuery.updateContactToSecondary(newerContact.id, olderContact.id);
            newerContact.linkedId = olderContact.id;
            newerContact.linkPrecedence = LinkPrecedence.SECONDARY;

            if (error) throw error;

            secondaryContactData && contactsData.push(secondaryContactData[0]);

            return res.status(200).send({ contact: transformContactResponse(contactsData as Contact[]) });
        }

        const partialMatchWithPhoneNumber = contactsData.find((contact: Contact) => contact.phone_number === phoneNumber);
        const partialMatchWithEmail = contactsData.find((contact: Contact) => contact.email === email);

        const exactMatch = contactsData.some((contact: Contact) => contact.phone_number === phoneNumber && contact.email === email);

        if (!exactMatch && ((partialMatchWithPhoneNumber && email) || (partialMatchWithEmail && phoneNumber))) { 
            const primaryContact = contactsData.find((contact: Contact) => contact.link_precedence === LinkPrecedence.PRIMARY);

            const { secondaryContactData, error } = await this.identityQuery.addSecondaryContact(phoneNumber, email, primaryContact.id);

            if (error) throw error;

            secondaryContactData && contactsData.push(secondaryContactData[0]);
        }

        return res.status(200).send({ contact: transformContactResponse(contactsData as Contact[]) });

    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Failed to Fetch Contacts', error: JSON.stringify(error) });
    }
  };

}
