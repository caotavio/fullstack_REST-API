'use strict';

const { User } = require('../models');
const bcryptjs = require('bcryptjs');
const auth = require('basic-auth');

const authenticateUser = async (req, res, next) => {
    let message = null;
    //check for user credentials and if authorized look for an email match
    const credentials = auth(req);
    if(credentials) {
      const user = await User.findOne(
          {
          raw: true,
          where: {
            emailAddress: credentials.name,
          },
      });
      //if email is a match, check and match password
      if(user) {
        const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
        //if full authentication is successful, dependig on the endpoint match with user.id - course(userId) || user(id)
        if(authenticated) {
          console.log(`Authentication successful for user: ${user.firstName} ${user.lastName}`);
          if(req.originalUrl.includes('courses')) {
            req.body.userId = user.id;
          } else if(req.originalUrl.includes('users')) {
            req.body.id = user.id;
            }
      //
      } else {
          //authentication was not successful
          message = `Invalid password. Access Denied. User: ${user.firstName} ${user.lastName}`;
          res.status(401).json({ message: message });
        }
        } else {
          //there was no user with an email address matching the email address in the authorization header
          message = `Username not found: ${credentials.name}`;
          res.status(404).json({ message: message });
        }
        } else {
          message = `Username or password invalid`;
          res.status(401).json({ message: message });
        }
    if(message) {
      console.warn(message);
      const err = new Error('Access Denied');
      err.status = (401);
      next(err);
    } else {
      //if there is no error message, user gets authenticated
      next();
    }
  }

  module.exports = authenticateUser;