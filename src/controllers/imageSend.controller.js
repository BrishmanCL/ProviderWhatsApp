import { messageImageSchema } from "../schemas/sendMessage.schema.js";

function imageSendController(handleCtx) {
    return handleCtx(async (bot, req, res) => {

        console.info(req.url)
        const { error, value } = messageImageSchema.validate(req.body);
        
        if (error) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(error.details[0]));
        }

        try {
            const { contact, text, image } = value;
            const resSend = await bot.sendMessage(contact, text ?? null, { media: image });

            const statusMessages = {
                0: { statusCode: 202, message: "Image message not sent" },
                1: { statusCode: 200, message: "Image message sent" },
            };

            const status = statusMessages[resSend.status] || { statusCode: 500, message: "Unknown image message status" };

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

export default imageSendController;