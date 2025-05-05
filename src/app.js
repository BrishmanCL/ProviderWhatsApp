import { createBot } from '@builderbot/bot'

import adapterProvider from './provider/index.js'
import adapterFlow from './flows/index.js'
import adapterDB from './database/index.js'
import setupRoutes from './router/index.js'

const PORT = process.env.PORT ?? 3008

const main = async () => {

    const { handleCtx, httpServer } = await createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    await setupRoutes(handleCtx)

    httpServer(+PORT)
}

main()
