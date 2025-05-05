import { BaileysProvider } from "@builderbot/provider-baileys";
import { createProvider } from "@builderbot/bot";

const adapterProvider = createProvider(BaileysProvider);

export default adapterProvider;