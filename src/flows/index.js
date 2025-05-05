import { join } from 'path'
import axios from 'axios'
import { createFlow, addKeyword, utils, EVENTS } from '@builderbot/bot'
import ChatWoot from '../services/chatwoot/index.js'

const discordFlow = addKeyword('doc').addAnswer(
    ['You can see the documentation here', '📄 https://builderbot.app/docs \n', 'Do you want to continue? *yes*'].join(
        '\n'
    ),
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
        if (ctx.body.toLocaleLowerCase().includes('yes')) {
            return gotoFlow(registerFlow)
        }
        await flowDynamic('Thanks!')
        return
    }
)

const welcomeFlow = addKeyword(['hi', 'hello', 'hola'])
    .addAnswer(`🙌 Hello welcome to this *Chatbot*`)
    .addAnswer(
        [
            'I share with you the following links of interest about the project',
            '👉 *doc* to view the documentation',
        ].join('\n'),
        { delay: 800, capture: true },
        async (ctx, { fallBack }) => {
            if (!ctx.body.toLocaleLowerCase().includes('doc')) {
                return fallBack('You should type *doc*')
            }
            return
        },
        [discordFlow]
    )

const registerFlow = addKeyword(utils.setEvent('REGISTER_FLOW'))
    .addAnswer(`What is your name?`, { capture: true }, async (ctx, { state }) => {
        await state.update({ name: ctx.body })
    })
    .addAnswer('What is your age?', { capture: true }, async (ctx, { state }) => {
        await state.update({ age: ctx.body })
    })
    .addAction(async (_, { flowDynamic, state }) => {
        await flowDynamic(`${state.get('name')}, thanks for your information!: Your age: ${state.get('age')}`)
    })

const fullSamplesFlow = addKeyword(['samples', utils.setEvent('SAMPLES')])
    .addAnswer(`💪 I'll send you a lot files...`)
    .addAnswer(`Send image from Local`, { media: join(process.cwd(), 'assets', 'sample.png') })
    .addAnswer(`Send video from URL`, {
        media: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTJ0ZGdjd2syeXAwMjQ4aWdkcW04OWlqcXI3Ynh1ODkwZ25zZWZ1dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LCohAb657pSdHv0Q5h/giphy.mp4',
    })
    .addAnswer(`Send audio from URL`, { media: 'https://cdn.freesound.org/previews/728/728142_11861866-lq.mp3' })
    .addAnswer(`Send file from URL`, {
        media: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    })

const mediaFlow = addKeyword(EVENTS.MEDIA).addAction(async (ctx, {provider}) => {

    try {
        const replySearhContact = await ChatWoot.SearchContact(ctx);

        if (replySearhContact == null) { //Contacto nuevo
            const { contact } = (await ChatWoot.CreateContact(ctx)).payload;
            const { id } = await ChatWoot.CreateConversation({ ctx: ctx, contactId: contact.id });
            await ChatWoot.CreateMessageIncoming({ ctx: ctx, conversationId: id });
            return;
        }
        //Contacto existe
        const replySearhConversation = await ChatWoot.SearchConversation({ contactId: replySearhContact.id });
        if (replySearhConversation == null) { //Conversacion nueva
            const { id } = await ChatWoot.CreateConversation({ ctx: ctx, contactId: replySearhContact.id });
            await ChatWoot.CreateMessageIncoming({ ctx: ctx, conversationId: id });
            return;
        }
        await ChatWoot.CreateMessageIncoming({ ctx: ctx, conversationId: replySearhConversation.id });
        return;

    } catch (error) {
        console.log(error);
    }
})

const initFlow = addKeyword(EVENTS.WELCOME).addAction(async (ctx) => {
    const id = ctx.key.remoteJid
    const phoneContact = ctx.from;

    console.log("Mensaje entrante");
    console.log(ctx);

    try {
        const replySearhContact = await ChatWoot.SearchContact(ctx);

        if (replySearhContact == null) { //Contacto nuevo
            const { contact } = (await ChatWoot.CreateContact(ctx)).payload;
            const { id } = await ChatWoot.CreateConversation({ ctx: ctx, contactId: contact.id });
            await ChatWoot.CreateMessageIncoming({ ctx: ctx, conversationId: id });
            return;
        }
        //Contacto existe
        const replySearhConversation = await ChatWoot.SearchConversation({ contactId: replySearhContact.id });
        if (replySearhConversation == null) { //Conversacion nueva
            const { id } = await ChatWoot.CreateConversation({ ctx: ctx, contactId: replySearhContact.id });
            await ChatWoot.CreateMessageIncoming({ ctx: ctx, conversationId: id });
            return;
        }
        await ChatWoot.CreateMessageIncoming({ ctx: ctx, conversationId: replySearhConversation.id });
        return;

    } catch (error) {
        console.log(error);
    }

});

//const adapterFlow = createFlow([welcomeFlow, registerFlow, fullSamplesFlow])
const adapterFlow = createFlow([initFlow, mediaFlow])

export default adapterFlow