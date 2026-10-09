
const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const router = express.Router();

// แปลงข้อมูล MongoDB ให้ Frontend เดิมใช้งานได้
function formatTask(task) {
  return {
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    category: task.category,
    dueDate: task.dueDate,
    done: task.done,
    createdAt: task.createdAt
  };
}

// จัดการข้อผิดพลาดจากฐานข้อมูล
function handleError(res, error) {
  console.error('Task API error:', error);

  if (
    error.name === 'ValidationError' ||
    error.name === 'CastError'
  ) {
    return res.status(400).json({
      error: 'Invalid task data'
    });
  }

  return res.status(500).json({
    error: 'Internal server error'
  });
}

// GET /api/tasks
// ดึงรายการงานทั้งหมด หรือกรองตามสถานะ
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.done !== undefined) {
      if (!['true', 'false'].includes(req.query.done)) {
        return res.status(400).json({
          error: 'done must be true or false'
        });
      }

      filter.done = req.query.done === 'true';
    }

    const tasks = await Task.find(filter);

    res.json(tasks.map(formatTask));
  } catch (error) {
    handleError(res, error);
  }
});

// GET /api/tasks/:id
// ดึงข้อมูล Task ตาม ID
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid task ID'
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    res.json(formatTask(task));
  } catch (error) {
    handleError(res, error);
  }
});

// POST /api/tasks
// เพิ่ม Task ใหม่ลง MongoDB
router.post('/', async (req, res) => {
  try {
    const { title, description, category, dueDate } = req.body;

    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        error: 'Title is required'
      });
    }

    const newTask = await Task.create({
      title: title.trim(),
      description: description || '',
      category: category || '',
      dueDate: dueDate || null,
      done: false
    });

    res.status(201).json(formatTask(newTask));
  } catch (error) {
    handleError(res, error);
  }
});

// PATCH /api/tasks/:id
// แก้ไขข้อมูลหรือสถานะของ Task
router.patch('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid task ID'
      });
    }

    const allowedFields = [
      'title', 'description', 'category', 'dueDate', 'done'
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    }

    if (updates.title !== undefined) {
      if (
        typeof updates.title !== 'string' ||
        !updates.title.trim()
      ) {
        return res.status(400).json({
          error: 'Title cannot be empty'
        });
      }

      updates.title = updates.title.trim();
    }

    if (updates.dueDate === '') {
      updates.dueDate = null;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    res.json(formatTask(task));
  } catch (error) {
    handleError(res, error);
  }
});

// DELETE /api/tasks/:id
// ลบ Task ออกจาก MongoDB
router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        error: 'Invalid task ID'
      });
    }

    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: 'Task not found'
      });
    }

    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
