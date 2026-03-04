const generateHealthSuggestion = (profile) => {
  const { age, healthGoal, medicalConditions } = profile;
  
  let suggestion = `Based on your profile: `;

  if (!age || !healthGoal) {
    return "Please complete your profile to get personalized health suggestions.";
  }

  if (healthGoal === 'heart') {
    suggestion += `For heart health at age ${age}, we recommend 150 minutes of moderate exercise weekly, a diet rich in omega-3 fatty acids, and regular blood pressure monitoring.`;
  } 
  else if (healthGoal === 'weight') {
    suggestion += `For weight management at age ${age}, focus on a balanced diet with a caloric deficit, strength training 3x per week, and tracking your daily food intake.`;
  } 
  else if (healthGoal === 'skin') {
    suggestion += `For skin health, maintain a consistent skincare routine with SPF 30+ daily, stay hydrated with 8 glasses of water, and consider vitamin C supplements.`;
  } 
  else if (healthGoal === 'mental') {
    suggestion += `For mental wellness, practice mindfulness meditation 10 minutes daily, maintain regular sleep schedule, and consider therapy if needed.`;
  } 
  else {
    suggestion += `For general fitness at age ${age}, aim for 30 minutes of daily activity, balanced nutrition, and annual health check-ups.`;
  }

  if (medicalConditions && medicalConditions.length > 0) {
    suggestion += ` Given your conditions (${medicalConditions.join(', ')}), please consult with your healthcare provider before starting any new health regimen.`;
  }

  return suggestion;
};


// ------------------------ CONTROLLERS ------------------------------

// @desc   AI Health Suggestion Based on Profile
// exports.getHealthSuggestion = async (req, res) => {
//   try {
//     const profile = req.user.profile || {};
//     const suggestion = generateHealthSuggestion(profile);

//     return res.json({ success: true, suggestion });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };


// @desc   Simple AI Chat Response
// exports.chatWithAI = async (req, res) => {
//   try {
//     const { message } = req.body;

//     let response = 
//       "I'm here to help with general health information. For medical advice, consult a doctor.";

//     const text = message.toLowerCase();

//     if (text.includes('blood pressure')) {
//       response = "Normal blood pressure is around 120/80 mmHg. Hypertension starts at 130/80 or higher. Regular monitoring is recommended.";
//     } 
//     else if (text.includes('diabetes')) {
//       response = "Diabetes management includes blood sugar monitoring, proper diet, exercise, and prescribed medication.";
//     } 
//     else if (text.includes('exercise')) {
//       response = "Aim for at least 150 minutes of moderate aerobic activity weekly and strength training twice a week.";
//     }

//     return res.json({ success: true, response });

//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };



// -------------------- Simple AI Suggestions --------------------

export const getHealthSuggestion = async (req, res) => {
  const profile = req.user?.profile || {};

  const { age, healthGoal, medicalConditions } = profile;

  let suggestion = "Based on your profile: ";

  if (!age || !healthGoal) {
    return res.json({
      success: true,
      suggestion: "Please complete your profile to get personalized suggestions.",
    });
  }

  switch (healthGoal) {
    case "heart":
      suggestion += `For heart health at age ${age}, do regular cardio, reduce salt, and monitor blood pressure.`;
      break;
    case "weight":
      suggestion += `For weight control at age ${age}, maintain a caloric deficit and exercise 30 minutes daily.`;
      break;
    case "mental":
      suggestion += `For mental wellness, practice meditation and keep a consistent sleep routine.`;
      break;
    default:
      suggestion += `Maintain a balanced diet and exercise daily.`;
  }

  if (medicalConditions?.length > 0) {
    suggestion += ` Because you have: ${medicalConditions.join(", ")}, talk to a doctor before starting new plans.`;
  }

  return res.json({ success: true, suggestion });
};

// -------------------- AI Chat --------------------

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message)
      return res.status(400).json({ success: false, message: "Message is required" });

    let response =
      "I can give general health information only. Please consult a doctor for medical advice.";

    const text = message.toLowerCase();

    if (text.includes("blood pressure")) {
      response =
        "Normal BP is around 120/80 mmHg. High BP starts at 130/80. Try reducing salt and stress.";
    } else if (text.includes("diabetes")) {
      response =
        "Diabetes can be managed with diet control, medication, and regular sugar monitoring.";
    } else if (text.includes("exercise")) {
      response = "Adults should do 150 minutes of moderate exercise weekly.";
    }

    return res.json({ success: true, response });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
