import Joi from "joi";
import AppError from "../utils/appError.js";

export const validateRegister = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateRequestPasswordReset = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateResetPassword = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateCreateStaffUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('pharmacy', 'admin').required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateCreateMedicine = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    genericName: Joi.string().min(3).max(100).allow('', null),
    dosage: Joi.string().max(100).allow('', null),
    category: Joi.string().min(3).max(100).allow('', null),
    aliases: Joi.array().items(Joi.string().trim()).default([]),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateCreatePharmacy = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    ownerId: Joi.string().hex().length(24).required(),
    status: Joi.string().valid('pending', 'approved', 'suspended'),
    address: Joi.string().allow('', null),
    openingHours: Joi.string().allow('', null),
    location: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
    }).required(),
    contactInfo: Joi.object({
      phoneNumber: Joi.string().required(),
      email: Joi.string().email().allow('', null),
      socialMediaAddresses: Joi.array().items(Joi.string()).default([]),
    }).required(),
    isOpen: Joi.boolean(),
  }).unknown(false);

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateUpdatePharmacy = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100),
    ownerId: Joi.string().hex().length(24),
    status: Joi.string().valid('pending', 'approved', 'suspended'),
    address: Joi.string().allow('', null),
    openingHours: Joi.string().allow('', null),
    location: Joi.object({
      type: Joi.string().valid('Point').required(),
      coordinates: Joi.array().items(Joi.number()).length(2).required(),
    }),
    contactInfo: Joi.object({
      phoneNumber: Joi.string(),
      email: Joi.string().email().allow('', null),
      socialMediaAddresses: Joi.array().items(Joi.string()).default([]),
    }),
    isOpen: Joi.boolean(),
  }).min(1);

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateUpdateUser = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    role: Joi.string().valid('user', 'pharmacy', 'admin'),
  }).min(1);

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateCreatePharmacyMedicine = (req, res, next) => {
  const schema = Joi.object({
    medicineId: Joi.string().hex().length(24).required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().min(0).default(0),
    availability: Joi.boolean().default(true),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};

export const validateUpdatePharmacyMedicine = (req, res, next) => {
  const schema = Joi.object({
    price: Joi.number().min(0),
    stock: Joi.number().min(0),
    availability: Joi.boolean(),
  }).min(1);

  const { error } = schema.validate(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  next();
};