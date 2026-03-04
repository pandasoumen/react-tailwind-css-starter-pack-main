// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');

// // Simple AI suggestion logic
// const generateHealthSuggestion = (profile) => {
//   const { age, healthGoal, medicalConditions } = profile;
  
//   let suggestion = `Based on your profile: `;
  
//   if (!age || !healthGoal) {
//     return "Please complete your profile to get personalized health suggestions.";
//   }

//   if (healthGoal === 'heart') {
//     suggestion += `For heart health at age ${age}, we recommend 150 minutes of moderate exercise weekly, a diet rich in omega-3 fatty acids, and regular blood pressure monitoring.`;
//   } else if (healthGoal === 'weight') {
//     suggestion += `For weight management at age ${age}, focus on a balanced diet with a caloric deficit, strength training 3x per week, and tracking your daily food intake.`;
//   } else if (healthGoal === 'skin') {
//     suggestion += `For skin health, maintain a consistent skincare routine with SPF 30+ daily, stay hydrated with 8 glasses of water, and consider vitamin C supplements.`;
//   } else if (healthGoal === 'mental') {
//     suggestion += `For mental wellness, practice mindfulness meditation 10 minutes daily, maintain regular sleep schedule, and consider therapy if needed.`;
//   } else {
//     suggestion += `For general fitness at age ${age}, aim for 30 minutes of daily activity, balanced nutrition, and annual health check-ups.`;
//   }

//   if (medicalConditions && medicalConditions.length > 0) {
//     suggestion += ` Given your conditions (${medicalConditions.join(', ')}), please consult with your healthcare provider before starting any new health regimen.`;
//   }

//   return suggestion;
// };

// // @route   POST /api/ai/suggestion
// // @desc    Get AI health suggestion
// // @access  Private
// router.post('/suggestion', protect, async (req, res) => {
//   try {
//     const profile = req.user.profile || {};
//     const suggestion = generateHealthSuggestion(profile);

//     res.json({ success: true, suggestion });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// // @route   POST /api/ai/chat
// // @desc    AI chat for health queries
// // @access  Private
// router.post('/chat', protect, async (req, res) => {
//   try {
//     const { message } = req.body;

//     let response = "I'm here to help with general health information. For specific medical advice, please consult with a healthcare professional.";

//     if (message.toLowerCase().includes('blood pressure')) {
//       response = "Normal blood pressure is typically around 120/80 mmHg. High blood pressure (hypertension) is 130/80 or higher. Regular monitoring and lifestyle changes can help manage it.";
//     } else if (message.toLowerCase().includes('diabetes')) {
//       response = "Diabetes management includes monitoring blood sugar, healthy eating, regular exercise, and medication as prescribed. Regular check-ups with your doctor are essential.";
//     } else if (message.toLowerCase().includes('exercise')) {
//       response = "Adults should aim for at least 150 minutes of moderate-intensity aerobic activity per week, plus muscle-strengthening activities twice a week.";
//     }

//     res.json({ success: true, response });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// module.exports = router;

import express from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/authorize.js";
import { getHealthSuggestion, chatWithAI } from "../controllers/ai.js";

const router = express.Router();

// AI Suggestion
router.post("/suggestion", protect, getHealthSuggestion);

// AI Chat
router.post("/chat", protect, chatWithAI);

export default router;
