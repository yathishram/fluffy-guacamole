
## Algorithm for `/identify` endpoint

1. **Parse the incoming request.**

2. **Search in the Contact table:**

- First, try to find a row with the given email.

- If email is not provided or not found, try to find a row with the given phoneNumber.

3. **Process based on the search results:**

- If neither email nor phoneNumber is found in the table, insert a new primary contact.

- If an entry is found:

- If the found contact has all details matching the request, return the consolidated contact info.

- If the found contact has only one matching detail (either email or phoneNumber) but the other detail is different, insert a new secondary contact linked to the primary one.

- If an email matches a secondary contact, but the phoneNumber matches a different primary contact, update the second primary contact to become secondary and linked to the first one.

4. **Prepare the response:**

- Identify primary contact.

- Gather all emails and phoneNumbers associated with that primary contact (including from secondary contacts).

- Return the consolidated contact info.

## API Design

### POST `/identify`

#### Request Payload

    {
    
    "email"?: string,
    "phoneNumber"?: number
    
    }

#### Response  Payload

    {
    
    "contact": {
    
    "primaryContatctId": number,
    
    "emails": string[],
    
    "phoneNumbers": string[],
    
    "secondaryContactIds": number[]
    
    }
    
    }

#### Error Response

    If neither email nor phoneNumber is provided, return a 400 error response.
    
    For other server errors, return a 500 error response.
