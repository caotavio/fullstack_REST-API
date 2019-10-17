'use strict';

const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcryptjs = require('bcryptjs');
const authenticateUser = require('./authentication');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

//async/await handler
const asyncHandler = cb => {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch(err) {
        next(err);
      }
    }
}
  
//GET - 'api/users/' - returns the authenticated user
router.get('/', authenticateUser, asyncHandler(async (req, res) => {
    const user = await User.findByPk(
    req.body.id,
    {
        attributes: {
        exclude: ['password', 'createdAt', 'updatedAt'],
        },
    }
    );
    res.json(user);
}));
  
//POST - 'api/user/' - checks if password exists, hashes it, creates a user.
//sets the response location. Returns no content
router.post('/', asyncHandler(async (req, res) => {
  let error = new Array();
  let message = null;

  if (!req.body.firstName){
    message = `Please include first name.`;
    error.push(message);
  } 
  
  if (!req.body.lastName){
    message = `Please include last name.`;
    error.push(message);
  } 
  
  if (!req.body.emailAddress){
    message = `A valid email address is required.`;
    error.push(message);
  } 
  
  if (!req.body.password){
    message = `It is important that you create a password for future access.`;
    error.push(message);
  } 
  
  if (req.body.password !== req.body.confirmPassword) {
    message = `This field's input must match your password.`;
    error.push(message);
  }
  
  if (error.length > 0) {
    res.status(422).json({ errors: error });
  } else {
    if(req.body.password) {
      req.body.password = await bcryptjs.hashSync(req.body.password);
      await User.create(req.body);
    } else {
      await User.create(req.body);
    }
    res.location('/');
    res.status(201).json([]).end();
  }
}));

module.exports = router;