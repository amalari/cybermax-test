import * as joi from "joi"

const insertLocationSchema = joi.object({
  name: joi.string().required(),
  number: joi.string().required(),
  area: joi.number(),
})
export const createLocationSchema = insertLocationSchema

export const updateLocationSchema = insertLocationSchema
