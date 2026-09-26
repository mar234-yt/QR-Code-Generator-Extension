(function () {
  var input = document.getElementById('url');
  var qrBox = document.getElementById('qr');
  var encoded = document.getElementById('encoded');
  var btn = document.getElementById('download');
  var current = '';
  var logoData = null;
  var logoSizePct = 22;
  var overlay = document.getElementById('logoOverlay');
  var logoBtn = document.getElementById('logoBtn');
  var logoFile = document.getElementById('logoFile');
  var logoPreview = document.getElementById('logoPreview');
  var logoThumb = document.getElementById('logoThumb');
  var logoSize = document.getElementById('logoSize');
  var logoRemove = document.getElementById('logoRemove');

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function normalize(v) {
    v = v.trim();
    if (!v) return '';
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(v)) v = 'https://' + v;
    return v;
  }

  function setHint(text) {
    qrBox.classList.add('empty');
    qrBox.innerHTML = '';
    var s = document.createElement('span');
    s.className = 'hint mono';
    s.textContent = text;
    qrBox.appendChild(s);
    encoded.textContent = '';
    btn.disabled = true;
    overlay.hidden = true;
  }

  function render() {
    var text = normalize(input.value);
    current = text;
    if (!text) {
      setHint('Type a link — your QR code appears here');
      return;
    }
    try {
      var qr = qrcode(0, logoData ? 'H' : 'M');
      qr.addData(text);
      qr.make();
      qrBox.classList.remove('empty');
      qrBox.innerHTML = qr.createSvgTag({ cellSize: 2, margin: 0, scalable: true });
      var svg = qrBox.querySelector('svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('role', 'img');
      svg.setAttribute('aria-label', 'QR code for ' + text);
      encoded.textContent = text;
      encoded.title = text;
      btn.disabled = false;
      updateOverlay();
    } catch (e) {
      current = '';
      setHint('This text is too long for a single QR code');
    }
  }

  function updateOverlay() {
    if (logoData && current) {
      overlay.src = logoData;
      overlay.style.width = logoSizePct + '%';
      overlay.hidden = false;
    } else {
      overlay.hidden = true;
    }
  }

  function roundRectPath(x, px, py, w, h, r) {
    x.beginPath();
    x.moveTo(px + r, py);
    x.arcTo(px + w, py, px + w, py + h, r);
    x.arcTo(px + w, py + h, px, py + h, r);
    x.arcTo(px, py + h, px, py, r);
    x.arcTo(px, py, px + w, py, r);
    x.closePath();
  }

  logoBtn.addEventListener('click', function () { logoFile.click(); });
  logoFile.addEventListener('change', function () {
    var f = logoFile.files && logoFile.files[0];
    if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      logoData = rd.result;
      logoThumb.src = logoData;
      logoBtn.hidden = true;
      logoPreview.hidden = false;
      render();
    };
    rd.readAsDataURL(f);
    logoFile.value = '';
  });
  logoRemove.addEventListener('click', function () {
    logoData = null;
    logoPreview.hidden = true;
    logoBtn.hidden = false;
    render();
  });
  logoSize.addEventListener('input', function () {
    logoSizePct = parseInt(logoSize.value, 10) || 22;
    updateOverlay();
  });

  // --- Extension: fill from current browser tab (uses activeTab permission) ---
  var tabBtn = document.getElementById('tabBtn');
  var hasTabs = (typeof chrome !== 'undefined') && chrome.tabs && chrome.tabs.query;
  function withTabUrl(cb) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var u = tabs && tabs[0] && tabs[0].url;
      if (u && /^https?:/i.test(u)) cb(u);
    });
  }
  if (hasTabs) {
    tabBtn.hidden = false;
    withTabUrl(function (u) { input.value = u; render(); });
    tabBtn.addEventListener('click', function () {
      withTabUrl(function (u) { input.value = u; render(); input.focus(); });
    });
  } else {
    tabBtn.hidden = true;
  }

  input.addEventListener('input', debounce(render, 120));
  render();

  btn.addEventListener('click', function () {
    if (!current) return;
    var qr = qrcode(0, logoData ? 'H' : 'M');
    qr.addData(current);
    qr.make();
    var n = qr.getModuleCount();
    var quiet = 4;
    var scale = Math.max(4, Math.ceil(1024 / (n + quiet * 2)));
    var size = (n + quiet * 2) * scale;
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var x = c.getContext('2d');
    x.fillStyle = '#ffffff';
    x.fillRect(0, 0, size, size);
    x.fillStyle = '#000000';
    for (var r = 0; r < n; r++) {
      for (var col = 0; col < n; col++) {
        if (qr.isDark(r, col)) {
          x.fillRect((col + quiet) * scale, (r + quiet) * scale, scale, scale);
        }
      }
    }
    var name = 'qrcode';
    try {
      var h = new URL(current).hostname.replace(/^www\./, '');
      if (h) name = 'qrcode-' + h.replace(/[^a-z0-9.-]+/gi, '-');
    } catch (e) {}
    function save() {
      var a = document.createElement('a');
      a.download = name + '.png';
      a.href = c.toDataURL('image/png');
      a.click();
    }

    if (logoData) {
      var img = new Image();
      img.onload = function () {
        var box = Math.round(size * logoSizePct / 100);
        var cx = size / 2;
        var cy = size / 2;
        x.fillStyle = '#ffffff';
        roundRectPath(x, cx - box / 2, cy - box / 2, box, box, box * 0.22);
        x.fill();
        var inset = Math.round(box * 0.14);
        var aw = box - inset * 2;
        var ar = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 1;
        var dw = aw;
        var dh = aw;
        if (ar > 1) { dh = aw / ar; } else { dw = aw * ar; }
        x.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
        save();
      };
      img.onerror = save;
      img.src = logoData;
    } else {
      save();
    }
  });
})();
