import Joi from "joi"

const messageImageSchema = Joi.object({
    contact: Joi.string().required(),
    text: Joi.string().optional(),
    image: Joi.string().regex(/(.*)\.(jpg|jpeg|png|gif|bmp|tiff|svg|webp)$/i).required()
});

const messageTextSchema = Joi.object({
    contact: Joi.string().required(),
    text: Joi.string().required()
})

const messageVideoSchema = Joi.object({
    contact: Joi.string().required(),
    text: Joi.string().optional(),
    video: Joi.string().regex(/(.*)\.(mp4|mkv|avi|mov|wmv|flv|webm|ogg)$/i).required()
})

const messageAudioSchema = Joi.object({
    contact: Joi.string().required(),
    audio: Joi.string().regex(/(.*)\.(mp3|wav|ogg|flac|aac|m4a)$/i).required()
})

const messageDocumentSchema = Joi.object({
    contact: Joi.string().required(),
    text: Joi.string().optional(),
    document: Joi.string().regex(/(.*)\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/i).required()
})

export { messageImageSchema, messageTextSchema, messageVideoSchema, messageAudioSchema, messageDocumentSchema }