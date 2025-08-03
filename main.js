document.getElementById("fileInput").addEventListener("change", handleFile);

async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const metadataDiv = document.getElementById("metadata");
  metadataDiv.innerHTML = `<h2>File Info</h2>
    <p><strong>Name:</strong> ${file.name}</p>
    <p><strong>Type:</strong> ${file.type}</p>
    <p><strong>Size:</strong> ${file.size} bytes</p>
    <p><strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleString()}</p>`;

  const type = file.type;

  if (type.startsWith("image/")) {
    handleImage(file);
  } else if (type === "application/pdf") {
    handlePDF(file);
  } else if (type.startsWith("audio/") || type === "audio/mpeg") {
    handleAudio(file);
  } else if (type.startsWith("video/")) {
    await handleVideo(file);
  } else {
    const unknownDiv = document.createElement("div");
    unknownDiv.innerHTML = `<h3>Unsupported or unknown file type</h3>`;
    metadataDiv.appendChild(unknownDiv);
  }
}

function handleImage(file) {
  const metadataDiv = document.getElementById("metadata");
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = document.createElement("img");
    img.src = e.target.result;
    img.style.maxWidth = "300px";
    metadataDiv.appendChild(img);

    EXIF.getData(file, function () {
      const allMetaData = EXIF.getAllTags(this);
      const exifDiv = document.createElement("div");
      exifDiv.innerHTML = "<h3>EXIF Data</h3><pre>" + JSON.stringify(allMetaData, null, 2) + "</pre>";
      metadataDiv.appendChild(exifDiv);
    });
  };
  reader.readAsDataURL(file);
}

function handleAudio(file) {
  const metadataDiv = document.getElementById("metadata");

  jsmediatags.read(file, {
    onSuccess: function (tag) {
      const tags = tag.tags;
      const audioInfo = document.createElement("div");
      audioInfo.innerHTML = `<h3>Audio Metadata</h3>
        <p><strong>Title:</strong> ${tags.title || "N/A"}</p>
        <p><strong>Artist:</strong> ${tags.artist || "N/A"}</p>
        <p><strong>Album:</strong> ${tags.album || "N/A"}</p>
        <p><strong>Year:</strong> ${tags.year || "N/A"}</p>`;

      if (tags.picture) {
        const base64String = tags.picture.data.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        const imageUrl = `data:${tags.picture.format};base64,${btoa(base64String)}`;
        const img = document.createElement("img");
        img.src = imageUrl;
        img.style.maxWidth = "200px";
        audioInfo.appendChild(img);
      }

      metadataDiv.appendChild(audioInfo);
    },
    onError: function (error) {
      console.error("jsmediatags error", error);
      metadataDiv.innerHTML += "<p>Could not read audio metadata.</p>";
    }
  });
}

function handlePDF(file) {
  const metadataDiv = document.getElementById("metadata");
  const reader = new FileReader();

  reader.onload = function () {
    const typedarray = new Uint8Array(reader.result);

    pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
      const pdfDiv = document.createElement("div");
      pdfDiv.innerHTML = `<h3>PDF Metadata</h3>
        <p><strong>Pages:</strong> ${pdf.numPages}</p>`;

      pdf.getMetadata().then(function (data) {
        pdfDiv.innerHTML += `<pre>${JSON.stringify(data.info, null, 2)}</pre>`;
        metadataDiv.appendChild(pdfDiv);
      });
    });
  };

  reader.readAsArrayBuffer(file);
}

async function handleVideo(file) {
  const metadataDiv = document.getElementById("metadata");


  const loadingEl = document.createElement("p");
  loadingEl.textContent = "Reading video metadata...";
  metadataDiv.appendChild(loadingEl);
  
  await new Promise(r => setTimeout(r, 0));

  const mediaInfo = await MediaInfo({ format: 'object' });

  const readChunk = (chunkSize, offset) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
    });

  const chunkSize = file.size;

  const result = await mediaInfo.analyzeData(
    () => file.size,
    (size, offset) => readChunk(chunkSize, offset)
  );

  loadingEl.remove();

  const videoDiv = document.createElement("div");
  videoDiv.innerHTML = `<h3>Video Metadata</h3><pre>${JSON.stringify(result, null, 2)}</pre>`;
  metadataDiv.appendChild(videoDiv);
}
