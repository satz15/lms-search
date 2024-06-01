// // const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// const app = express();

// app.use(cors());
// app.use(express.json());

// app.post('/api/get-topics', async (req, res) => {
//   const { topic, grade, subTopics } = req.body;

//   // Example of integrating with a hypothetical ChatGPT-like API
//   try {
//     const response = await axios.post('https://example.com/chatgpt-endpoint', {
//       topic,
//       grade,
//       subTopics
//     });

//     res.json({ topics: response.data.topics });
//   } catch (error) {
//     console.error('Error calling ChatGPT API:', error);
//     res.status(500).json({ message: 'Error fetching topics' });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
