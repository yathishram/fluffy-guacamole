import { pool } from '../../config/dbConfig';
import { Contact } from '../../types/common.types';

export class IdentityQuery {
  getContacts = async (phoneNumber?: string, email?: string) => {
    const query = `
        WITH RECURSIVE linked_contacts AS (
            SELECT id, phone_number, email, linked_id, link_precedence, created_at, updated_at
            FROM contact
            WHERE phone_number = $1 OR email = $2
        
            UNION
        
            SELECT c.id, c.phone_number, c.email, c.linked_id, c.link_precedence, c.created_at, c.updated_at
            FROM contact c
            JOIN linked_contacts lc ON c.id = lc.linked_id OR lc.id = c.linked_id
        )
        
        SELECT * FROM linked_contacts;
        `;

    const values = [phoneNumber, email];

    try {
      const { rows } = await pool.query(query, values);
      return { contactsData: rows };
    } catch (error) {
      console.log(error);
      return { error };
    }
  };

  addPrimaryContact = async (phoneNumber: string, email: string) => {
    const query = `
            INSERT INTO contact(phone_number, email, linked_id, link_precedence)
            VALUES($1, $2, $3, $4)
            RETURNING *;
        `;

    const values = [phoneNumber, email, null, 'primary'];

    try {
      const { rows } = await pool.query(query, values);
      return { primaryContactData: rows };
    } catch (error) {
      console.log(error);
      return { error };
    }
  };

  addSecondaryContact = async (phoneNumber: string, email: string, linkedId: Number) => {
    const query = `
            INSERT INTO contact(phone_number, email, linked_id, link_precedence)
            VALUES($1, $2, $3, $4)
            RETURNING *;
        `;

    const values = [phoneNumber, email, linkedId, 'secondary'];

    try {
      const { rows } = await pool.query(query, values);
      return { secondaryContactData: rows };
    } catch (error) {
      console.log(error);
      return { error };
    }
  };

  updateContactToSecondary = async (contactId: Number, linkedId: Number) => {
    const query = `
            UPDATE contact
            SET linked_id = $1, link_precedence = $2
            WHERE id = $3
            RETURNING *;
        `;

    const values = [linkedId, 'secondary', contactId];

    try {
      const { rows } = await pool.query(query, values);
      return { secondaryContactData: rows };
    } catch (error) {
      console.log(error);
      return { error };
    }
  };
}
