import {messageTextSchema} from '../schemas/sendMessage.schema.js';

function textSendController(handleCtx) {
    return handleCtx(async (bot, req, res) => {
        console.info(req.url);
        const { error, value } = messageTextSchema.validate(req.body);

        if (error) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(error.details[0]));
        }

        try {
            const { contact, text } = value;

            const resSend = await bot.sendMessage(contact, text, {});

            const statusMessages = {
                0: { statusCode: 202, message: "Text message not sent" },
                1: { statusCode: 200, message: "Text message sent" },
            };

            const status = statusMessages[resSend.status] || { statusCode: 500, message: "Unknown text message status" };

            res.statusCode = status.statusCode;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: status.message }));
        } catch (error) {
            console.error(error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ message: 'An unexpected error occurred on the server. Please try again later.' }));
        }
    });
}

export default textSendController;