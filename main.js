const fileInput = document.getElementById("fileInput");
const output = document.getElementById("output");

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  output.innerHTML = "";

  // Thông tin chung
  const general = document.createElement("section");
  general.innerHTML = `<h2>📁 General Info</h2>
    <ul>
      <li><strong>Name:</strong> ${file.name}</li>
      <li><strong>Size:</strong> ${file.size} bytes</li>
      <li><strong>Type (MIME):</strong> ${file.type || "Unknown"}</li>
    </ul>`;
  output.appendChild(general);

  // SHA-256
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  general.querySelector("ul").innerHTML += `<li><strong>SHA-256:</strong> ${hashHex}</li>`;

  // Ảnh
  if (file.type.startsWith("image/")) {
    const section = document.createElement("section");
    section.innerHTML = `<h2>📷 Image Metadata</h2><ul><li>Loading...</li></ul>`;
    output.appendChild(section);

    EXIF.getData(file, function () {
      const exif = EXIF.getAllTags(this);
      const list = section.querySelector("ul");
      list.innerHTML = "";

      for (const tag in exif) {
        list.innerHTML += `<li><strong>${tag}:</strong> ${exif[tag]}</li>`;
      }

      if (Object.keys(exif).length === 0) {
        list.innerHTML = "<li>No EXIF data found.</li>";
      }
    });
  }

  // MP3
  else if (file.type === "audio/mpeg") {
    const section = document.createElement("section");
    section.innerHTML = `<h2>🎵 MP3 Metadata</h2><ul><li>Loading...</li></ul>`;
    output.appendChild(section);

    window.jsmediatags.read(file, {
      onSuccess: function(tag) {
        const tags = tag.tags;
        const list = section.querySelector("ul");
        list.innerHTML = "";

        for (const key in tags) {
          if (key === "picture") continue;
          list.innerHTML += `<li><strong>${key}:</strong> ${tags[key]}</li>`;
        }

        if (tags.picture) {
          const base64 = arrayBufferToBase64(tags.picture.data);
          const img = document.createElement("img");
          img.src = `data:${tags.picture.format};base64,${base64}`;
          img.style.maxWidth = "100px";
          list.innerHTML += `<li><strong>Cover:</strong><br/>`;
          list.lastChild.appendChild(img);
        }
      },
      onError: function(err) {
        section.querySelector("ul").innerHTML = `<li>Error reading ID3: ${err.info}</li>`;
      }
    });
  }

  // Video
  else if (file.type.startsWith("video/")) {
    const section = document.createElement("section");
    section.innerHTML = `<h2>🎥 Video Info</h2><ul><li>Loading...</li></ul>`;
    output.appendChild(section);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = function () {
      const duration = video.duration.toFixed(2);
      const width = video.videoWidth;
      const height = video.videoHeight;
      section.querySelector("ul").innerHTML = `
        <li><strong>Duration:</strong> ${duration}s</li>
        <li><strong>Resolution:</strong> ${width} x ${height}</li>
      `;
      URL.revokeObjectURL(video.src);
    };
  }

  // PDF
  else if (file.type === "application/pdf") {
    const section = document.createElement("section");
    section.innerHTML = `<h2>📄 PDF Info</h2><ul><li>Loading...</li></ul>`;
    output.appendChild(section);

    const reader = new FileReader();
    reader.onload = function() {
      const typedarray = new Uint8Array(this.result);
      pdfjsLib.getDocument({ data: typedarray }).promise.then(function(pdf) {
        section.querySelector("ul").innerHTML = `
          <li><strong>Pages:</strong> ${pdf.numPages}</li>
        `;
        return pdf.getMetadata();
      }).then((meta) => {
        if (meta.info.Title) {
          section.querySelector("ul").innerHTML += `
            <li><strong>Title:</strong> ${meta.info.Title}</li>
          `;
        }
      }).catch(err => {
        section.querySelector("ul").innerHTML = `<li>Error reading PDF: ${err.message}</li>`;
      });
    };
    reader.readAsArrayBuffer(file);
  }
});

// Helper: convert binary to Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  for (let b of bytes) {
    binary += String.fromCharCode(b);
  }
  return window.btoa(binary);
}
