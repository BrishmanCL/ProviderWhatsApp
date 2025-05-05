import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import FormData from 'form-data';
import { downloadMediaMessage } from '@whiskeysockets/baileys'

class ChatWoot {

    constructor() {

        this.CHATWOOT_API_ACCESS_TOKEN = process.env.CHATWOOT_API_ACCESS_TOKEN;
        this.CHATWOOT_ACCOUNT_ID = process.env.CHATWOOT_ACCOUNT_ID;
        this.CHATWOOT_INBOX_ID = process.env.CHATWOOT_INBOX_ID;
        const host = process.env.CHATWOOT_HOST;
        this.URI = `${host}`;

        console.log("CHATWOOT_HOST:", process.env.CHATWOOT_HOST);
        console.log("CHATWOOT_ACCOUNT_ID:", process.env.CHATWOOT_ACCOUNT_ID);
        console.log("CHATWOOT_API_ACCESS_TOKEN:", process.env.CHATWOOT_API_ACCESS_TOKEN);
        console.log("this.URI:", this.URI);
        return this;
    }

    async SearchContact(contact) {

        const { name, from } = contact;

        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${this.URI}/api/v1/accounts/${this.CHATWOOT_ACCOUNT_ID}/contacts/search?q=+${from}`,
                headers: {
                    'api_access_token': this.CHATWOOT_API_ACCESS_TOKEN
                }
            };

            const replySearhContact = (await axios.request(config)).data;

            if (replySearhContact?.meta?.count == 0) {
                return null;
            } else {
                return replySearhContact.payload[0];
            }

        } catch (error) {
            throw error;
        }
    }

    async CreateContact(contact) {
        const { name, from } = contact;
        try {

            let data = JSON.stringify({
                "inbox_id": this.CHATWOOT_INBOX_ID,
                "name": name,
                //"email": "string",
                "phone_number": `+${from}`,
                //"avatar": "string",
                //"avatar_url": "string",
                //"identifier": "string",
                //"custom_attributes": {}
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${this.URI}/api/v1/accounts/${this.CHATWOOT_ACCOUNT_ID}/contacts`,
                headers: {
                    'api_access_token': this.CHATWOOT_API_ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                },
                data: data
            };

            const replyCreateContact = (await axios.request(config)).data;
            return replyCreateContact;

        } catch (error) {
            throw error;
        }
    }

    async SearchConversation({ contactId }) {
        // const { name, from, body } = ctx;
        try {
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${this.URI}/api/v1/accounts/${this.CHATWOOT_ACCOUNT_ID}/contacts/${contactId}/conversations`,
                headers: {
                    'api_access_token': this.CHATWOOT_API_ACCESS_TOKEN
                }
            };

            const replySearchConversation = (await axios.request(config)).data;

            const oneConversation = replySearchConversation.payload.find((e) => e.status === "open" || e.status === "pending"); //Retorna sola una conversacion respectivamente open, pending

            if (oneConversation) {
                if (oneConversation.status == "pending") {
                    await this._ChangeConversationStatus({ conversationId: oneConversation.id, status: "open" });
                }
                return oneConversation;
            }

            return null;

        } catch (error) {
            throw error;
        }
    }

    async _ChangeConversationStatus({ conversationId, status }) {
        try {
            let data = JSON.stringify({
                "status": status
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${this.URI}/api/v1/accounts/${this.CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/toggle_status`,
                headers: {
                    'api_access_token': this.CHATWOOT_API_ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                },
                data: data
            };

            const replyChangeConversationStatus = (await axios.request(config)).data;
            return replyChangeConversationStatus;

        } catch (error) {
            throw error;
        }
    }

    async CreateConversation({ ctx, contactId }) {
        const { name, from, body } = ctx;
        try {
            let data = JSON.stringify({
                "source_id": contactId,
                "inbox_id": this.CHATWOOT_INBOX_ID,
                "contact_id": contactId,
                "status": "open",
                /*
                "message": {
                    "content": "Retomando conversación"
                }
                    */
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${this.URI}/api/v1/accounts/${this.CHATWOOT_ACCOUNT_ID}/conversations`,
                headers: {
                    'api_access_token': this.CHATWOOT_API_ACCESS_TOKEN,
                    'Content-Type': 'application/json'
                },
                data: data
            };

            const replyCreateConversation = (await axios.request(config)).data;
            return replyCreateConversation;

        } catch (error) {
            throw error;
        }
    }


    async CreateMessageIncoming({ ctx, conversationId }) {

        const { name, from, body, message } = ctx;

        const data = new FormData();
        data.append('message_type', 'incoming');
        data.append('private', 'false');
        
        try { 
            if (message?.imageMessage) {
                const mediaBuffer = await downloadMediaMessage(ctx, 'buffer', {}, {});
                
                // Definir tipo MIME y nombre
                const mimeType = message.imageMessage?.mimetype || 'application/octet-stream';
                const filename = body+ '.' + mimeType.split('/')[1]; // ejemplo: media.jpg, media.mp4
                data.append('attachments[]', mediaBuffer, {
                    filename: filename,
                    contentType: mimeType,
                })
                data.append('content', message?.imageMessage?.caption);
            } else {
                data.append('content', body);
            }
        } catch (error) {
            console.error("Error al descargar el mensaje de media:", error.message);
        }
        

        try {

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${this.URI}/api/v1/accounts/${this.CHATWOOT_ACCOUNT_ID}/conversations/${conversationId}/messages`,
                headers: {
                    'api_access_token': this.CHATWOOT_API_ACCESS_TOKEN,
                    ...data.getHeaders()
                },
                data: data
            };

            const replyCreateMessageIncoming = (await axios.request(config)).data;
            return replyCreateMessageIncoming;
        } catch (error) {
            throw error;
        }
    }
}

export default new ChatWoot();