import { pool } from "../../config/dbConfig";
import { Contact } from "../../types/common.types";


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
        } catch(error) { 
            console.log(error);
            return { error };
        }
    }


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
        } catch(error) { 
            console.log(error);
            return { error };
        }
    }

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
        } catch(error) { 
            console.log(error);
            return { error };
        }
    }


    

}