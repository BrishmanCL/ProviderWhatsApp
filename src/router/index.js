import adapterProvider from "../provider/index.js"
import imageSendController from "../controllers/imageSend.controller.js";
import videoSendController from "../controllers/videoSend.controller.js";
import audioSendController from "../controllers/audioSend.controller.js";
import documentSendController from "../controllers/documentSend.controller.js";
import textSendController from "../controllers/textSend.controller.js";

export default function setupRoutes(handleCtx) {

    adapterProvider.server.post("/send/text", textSendController(handleCtx));
    adapterProvider.server.post("/send/image", imageSendController(handleCtx));
    adapterProvider.server.post("/send/video", videoSendController(handleCtx));
    adapterProvider.server.post("/send/audio", audioSendController(handleCtx));
    adapterProvider.server.post("/send/document", documentSendController(handleCtx));

    adapterProvider.server.post("/chatwoot-hook", handleCtx( async (bot, req, res) => {
        try {
            const body = req.body;
            const phone = body?.conversation?.meta?.sender?.phone_number;
            console.log("ejecutando webhook");
            //console.log(body);
            
            if(body.message_type == 'outgoing'){
                const content = body?.content;
                const urlMedia = Array.isArray(body?.attachments) && body?.attachments.length > 0 ? body?.attachments[0]?.data_url : null;
                await bot.sendMessage(`${phone}@s.whatsapp.net`, content ?? null, { media: urlMedia ?? null });
            }

            return res.end("enviado");
            
        } catch (error) {
            console.error(error)
        }
    }));


    adapterProvider.server.post(
        '/v1/messages',
        handleCtx(async (bot, req, res) => {
            const { number, message, urlMedia } = req.body
            await bot.sendMessage(number, message, { media: urlMedia ?? null })
            return res.end('sended')
        })
    )

    adapterProvider.server.post(
        '/v1/register',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('REGISTER_FLOW', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/samples',
        handleCtx(async (bot, req, res) => {
            const { number, name } = req.body
            await bot.dispatch('SAMPLES', { from: number, name })
            return res.end('trigger')
        })
    )

    adapterProvider.server.post(
        '/v1/blacklist',
        handleCtx(async (bot, req, res) => {
            const { number, intent } = req.body
            if (intent === 'remove') bot.blacklist.remove(number)
            if (intent === 'add') bot.blacklist.add(number)

            res.writeHead(200, { 'Content-Type': 'application/json' })
            return res.end(JSON.stringify({ status: 'ok', number, intent }))
        })
    )
}