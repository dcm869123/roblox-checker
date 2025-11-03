import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Hàm fetch có giới hạn thời gian chờ (timeout)
async function safeFetch(url, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch {
    clearTimeout(id);
    return null;
  }
}

app.get("/api/user/:username", async (req, res) => {
  try {
    const username = req.params.username.trim();

    // Lấy ID nhanh
    const userRes = await safeFetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
    if (!userRes) return res.status(504).json({ error: "⏳ Roblox phản hồi quá chậm, thử lại sau!" });

    const userData = await userRes.json();
    if (!userData.Id) return res.status(404).json({ error: "❌ Không tìm thấy user!" });

    // Gọi song song để tiết kiệm thời gian
    const [detailsRes, groupsRes, avatarRes] = await Promise.all([
      safeFetch(`https://users.roblox.com/v1/users/${userData.Id}`),
      safeFetch(`https://groups.roblox.com/v2/users/${userData.Id}/groups/roles`),
      safeFetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userData.Id}&size=150x150&format=Png`)
    ]);

    const details = detailsRes ? await detailsRes.json() : {};
    const groupsData = groupsRes ? await groupsRes.json() : { data: [] };
    const avatarData = avatarRes ? await avatarRes.json() : { data: [] };

    res.json({
      id: userData.Id,
      name: userData.Username,
      displayName: details.displayName || userData.Username,
      description: details.description || "",
      created: details.created || "",
      avatar: avatarData.data?.[0]?.imageUrl || "",
      groups: groupsData.data || []
    });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err.message);
    res.status(500).json({ error: "❌ Lỗi server!" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server đang chạy tại http://localhost:${PORT}`));
