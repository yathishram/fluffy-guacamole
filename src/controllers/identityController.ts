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
      if (error) throw error;

      if (!contactsData?.length) {
        return res.status(404).send({ message: 'No contacts found.' });
      }

      const contactResponse = transformContactResponse(contactsData as Contact[]);
      return res.status(200).send({ contact: contactResponse });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'Failed to Fetch Contacts', error: JSON.stringify(error) });
    }
  };
}
