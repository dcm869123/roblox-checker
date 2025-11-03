import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// API chính
app.get("/api/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const userRes = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
    const userData = await userRes.json();

    if (!userData.Id) return res.status(404).json({ error: "Không tìm thấy user!" });

    // Lấy thêm thông tin chi tiết & group
    const [detailsRes, groupsRes, avatarRes] = await Promise.all([
      fetch(`https://users.roblox.com/v1/users/${userData.Id}`),
      fetch(`https://groups.roblox.com/v2/users/${userData.Id}/groups/roles`),
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userData.Id}&size=150x150&format=Png&isCircular=false`)
    ]);

    const details = await detailsRes.json();
    const groupsData = await groupsRes.json();
    const avatarData = await avatarRes.json();

    res.json({
      id: userData.Id,
      name: userData.Username,
      displayName: details.displayName,
      description: details.description || "",
      created: details.created || "",
      avatar: avatarData.data?.[0]?.imageUrl || "",
      groups: groupsData.data || []
    });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    res.status(500).json({ error: "❌ Lỗi server!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server đang chạy tại http://localhost:${PORT}`));
