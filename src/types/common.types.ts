import { LinkPrecedence } from '../utils/common.enums';

export type Contact = {
  id: Number;
  phone_number?: string;
  email?: string;
  linked_id?: Number;
  link_precedence: LinkPrecedence;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
};

export type ContactResponse = {
  primaryContatctId: Number;
  emails: string[]; // first element being email of primary contact
  phoneNumbers: string[]; // first element being phoneNumber of primary contact
  secondaryContactIds: number[]; // Array of all Contact IDs that are "secondary" to the primary contact
};


export type DBError = { 
    error: any
}
