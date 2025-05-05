import { messageAudioSchema } from '../schemas/sendMessage.schema.js';

function audioSendController(handleCtx){
    return handleCtx(async (bot, req, res) => {
        console.info(req.url);
        const { error, value } = messageAudioSchema.validate(req.body);

        if (error) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end((error.details[0]));
        }

        try {
            const { contact, audio } = value;

            const resSend = await bot.sendMessage(contact, null, { media: audio });
            const statusMessages = {
                0: { statusCode: 202, message: "Audio message not sent" },
                1: { statusCode: 200, message: "Audio message sent" },
            };

            const status = statusMessages[resSend.status] || { statusCode: 500, message: "Unknown audio message status" };

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

export default audioSendController;