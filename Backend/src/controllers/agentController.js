/* import Agent from "../models/Agent.js";

// 🔹 Get all agents
export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Create agent
export const createAgent = async (req, res) => {
  try {
    const agent = new Agent({
      ...req.body,
      status: req.body.status || "inactive", // default
      documents: req.body.documents || [],   // default
    });

    const saved = await agent.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🔹 Delete agent
export const deleteAgent = async (req, res) => {
  try {
    await Agent.findByIdAndDelete(req.params.id);
    res.json({ message: "Agent deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Update agent (FIXED 🔥)
export const updateAgent = async (req, res) => {
  try {
    const updated = await Agent.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: "after", // ✅ FIX (no warning now)
        runValidators: true,     // ✅ extra safety
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; */



import Agent from "../models/Agent.js";

// 🔹 Get all agents (ONLY current user agents)
export const getAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Create agent (we will add Twilio here NEXT step)
export const createAgent = async (req, res) => {
  try {

    const agent = new Agent({
      ...req.body,
      userId: req.userId, // 🔥 IMPORTANT (multi-user support)
      status: req.body.status || "inactive",
      documents: req.body.documents || [],
    });

    const saved = await agent.save();

    res.status(201).json(saved);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// 🔹 Delete agent
export const deleteAgent = async (req, res) => {
  try {

    await Agent.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // 🔥 security (user deletes only own agent)
    });

    res.json({ message: "Agent deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Update agent
export const updateAgent = async (req, res) => {
  try {

    const updated = await Agent.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId, // 🔥 security
      },
      req.body,
      {
        returnDocument: "after",
        runValidators: true,
      }
    );

    if (!updated) {
      return res.status(404).json({ message: "Agent not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};