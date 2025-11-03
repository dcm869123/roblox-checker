// Tạo âm thanh
const clickSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_7df77e94e5.mp3?filename=click-124467.mp3");
const successSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_8ad76a216d.mp3?filename=bling-146912.mp3");

async function check() {
  const username = document.getElementById("username").value.trim();
  const result = document.getElementById("result");

  // phát âm thanh click khi bấm nút
  clickSound.currentTime = 0;
  clickSound.play();

  if (!username) {
    result.innerHTML = "<p style='color:yellow'>⚠ Nhập username!</p>";
    return;
  }

  result.innerHTML = "<p>⏳ Đang xử lý...</p>";

  try {
    const res = await fetch(`/api/user/${encodeURIComponent(username)}`);
    const data = await res.json();

    if (!res.ok) {
      result.innerHTML = `<p style='color:orange'>${data.error}</p>`;
      return;
    }

    // phát âm thanh thành công
    successSound.currentTime = 0;
    successSound.play();

    result.innerHTML = `
      <div class="card">
        <h3>${data.displayName} <small>(${data.username})</small></h3>
        <img src="${data.avatar}">
        <p><b>ID:</b> ${data.id}</p>
        <p><b>Mô tả:</b> ${data.description}</p>
        <p><b>Tạo lúc:</b> ${new Date(data.created).toLocaleString()}</p>
        <a href="${data.link}" target="_blank">🔗 Xem hồ sơ Roblox</a>
      </div>
    `;
  } catch (err) {
    result.innerHTML = `<p style='color:red'>Lỗi: ${err.message}</p>`;
  }
}
