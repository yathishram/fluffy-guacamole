import { IdentityQuery } from "../controllers/query/identityQuery";
import { Contact, ContactResponse } from "../types/common.types";
import { transformContactResponse } from "./helpers";

export class IdentityLib {
    identityQuery = new IdentityQuery();

    addPrimaryContact = async (phoneNumber: string, email: string): Promise<ContactResponse | null> => { 
        const { primaryContactData, error } = await this.identityQuery.addPrimaryContact(phoneNumber, email);
        if (error) throw error;
        return transformContactResponse(primaryContactData as Contact[]);
    }

}