'use strict';

const express = require('express');
const router = express.Router();
const { User, Course } = require('../models');
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
  
//GET - 'api/courses/' - returns a list of courses including the users that "own" each course
router.get('/', asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      //filters out irrelevant or private information
      attributes: {
        exclude: ['createdAt', 'updatedAt'],
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: {
            exclude: ['password', 'createdAt', 'updatedAt'],
          },
        },
      ],
    });
    res.json(courses);
}));
  
//GET - 'api/courses/:id' - returns the courses including the users that "own" the course for the provided course id
router.get('/:id', asyncHandler(async (req, res) => {
  const course = await Course.findByPk(
    req.params.id,
    {
      where: {
        id: req.params.id,
      },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],
    },
    include: [
      {
        model: User,
        as: 'user',
        attributes: {
          exclude: ['password', 'createdAt', 'updatedAt'],
        },
      },
    ],
  });

  if (course) {
    res.json(course);
  } else {
    // res.json({ error: 'Course not found' })
    res.status(404).json();
  }
}));
  
//POST - 'api/courses' - creates a course, sets the location header to the URI for the course. Returns no content
router.post('/', authenticateUser, asyncHandler(async (req, res) => {
  let error = new Array();
  let message = null;

  if (! req.body.title){
    message = `Please include title.`;
    error.push(message);
  }

  if (! req.body.description ){
    message = `Please include description.`;
    error.push(message);
  }

  if (error.length > 0) {
    res.status(422).json({ errors: error });
  }

  const newCourse = await Course.create(req.body);
  res.location(`/courses/${newCourse.id}`);
  res.status(201).end();
}));
  
//PUT - '/api/courses/:id' - Checks if the particular user owns the course first and then updates it. Returns no content
router.put('/:id', authenticateUser, asyncHandler(async (req, res, next) => {
    let course = await Course.findByPk(req.params.id);
    if(course.userId === req.body.userId) {
      let error = Array();
      let message = null;

      if (! req.body.title){
        message = `Please include title.`;
        error.push(message);
      }

      if (! req.body.description ){
        message = `Please include description.`;
        error.push(message);
      }

      if (error.length > 0) {
        res.status(422).json({ errors: error });
      }
      
      course.title = req.body.title;
      course.description = req.body.description;
      course.estimatedTime = req.body.estimatedTime;
      course.materialsNeeded = req.body.materialsNeeded;
      course = await course.save();
      res.status(204).end();
    } else {
      //throws error if the user is not the owner of the course
      const err = new Error('Sorry, you are not allowed to update courses you are not registered in.');
      err.status = (403);
      next(err);
    }
}));
  
//DELETE - '/api/courses/:id' - Checks if the particular user owns the course first and then deletes it. Returns no content
router.delete('/:id', authenticateUser, asyncHandler(async (req, res, next) => {
    const course = await Course.findByPk(req.params.id);
    if(course.userId === req.body.userId) {
      await course.destroy();
      res.status(204).end();
    } else {
      //throws error if the user is not the owner of the course
      const err = new Error('Sorry, you are not allowed to delete courses you are not registered in.');
      err.status = (403);
      next(err);
    }
}));

module.exports = router;