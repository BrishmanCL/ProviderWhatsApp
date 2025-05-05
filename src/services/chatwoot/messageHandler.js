import ChatWoot from './index.js';

export async function handleIncomingMessage(ctx) {
    try {
        const replySearhContact = await ChatWoot.SearchContact(ctx);

        if (replySearhContact == null) {
            // Contacto nuevo
            const { contact } = (await ChatWoot.CreateContact(ctx)).payload;
            const { id } = await ChatWoot.CreateConversation({ ctx, contactId: contact.id });
            await ChatWoot.CreateMessageIncoming({ ctx, conversationId: id });
            return;
        }

        // Contacto existe
        const replySearhConversation = await ChatWoot.SearchConversation({ contactId: replySearhContact.id });
        if (replySearhConversation == null) {
            // Conversación nueva
            const { id } = await ChatWoot.CreateConversation({ ctx, contactId: replySearhContact.id });
            await ChatWoot.CreateMessageIncoming({ ctx, conversationId: id });
            return;
        }

        // Conversación existente
        await ChatWoot.CreateMessageIncoming({ ctx, conversationId: replySearhConversation.id });
        return;

    } catch (error) {
        console.error('[ChatWoot Handler] Error:', error);
    }
}

export default handleIncomingMessage;