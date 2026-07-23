const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_INVITE_KEY = process.env.SECRET_INVITE_KEY;
const HF_API_TOKEN = process.env.HF_API_TOKEN;

const checkInviteKey = (req, res, next) => {
    const userKey = req.query.access_key;
    if (!userKey || userKey !== SECRET_INVITE_KEY) {
        return res.status(403).json({ error: "Unauthorized access." });
    }
    next();
};

app.get('/api/verify-access', checkInviteKey, (req, res) => {
    res.json({ status: "authorized" });
});

app.post('/api/generate-video', checkInviteKey, async (req, res) => {
    const { prompt } = req.body;

    try {
        const MODEL_URL = "https://api-inference.huggingface.co/models/Lightricks/LTX-Video";
        const response = await fetch(MODEL_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: prompt })
        });

        if (!response.ok) throw new Error("AI generation failed");

        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'video/mp4');
        res.send(Buffer.from(buffer));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server active on port ${PORT}`));
