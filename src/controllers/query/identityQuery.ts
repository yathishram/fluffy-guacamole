import { pool } from '../../config/dbConfig';

export class IdentityQuery {
  getContacts = async (phoneNumber?: string, email?: string) => {
    const query = `
            WITH RECURSIVE linked_contacts AS (
                SELECT id, phone_number, email, linked_id, link_precedence
                FROM contact
                WHERE phone_number = $1 OR email = $2
                UNION
                SELECT c.id, c.phone_number, c.email, c.linked_id, c.link_precedence
                FROM contact c
                JOIN linked_contacts lc ON c.phone_number = lc.phone_number OR c.email = lc.email
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
}
