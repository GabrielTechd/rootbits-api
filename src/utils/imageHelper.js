/**
 * Converte entre data URL / base64 (enviado pelo cliente) e Buffer (armazenado no MongoDB).
 * Aceita: "data:image/jpeg;base64,..." ou { data: "base64string", contentType: "image/jpeg" }
 */
function parseImageInput(input) {
  if (!input) return null;
  if (typeof input === 'string') {
    const match = input.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return {
      contentType: match[1].trim(),
      data: Buffer.from(match[2], 'base64')
    };
  }
  if (input.data && typeof input.data === 'string') {
    const data = Buffer.from(input.data, 'base64');
    const contentType = input.contentType || 'image/jpeg';
    return { contentType, data };
  }
  return null;
}

function bufferToBase64(buffer) {
  if (!buffer) return null;
  if (Buffer.isBuffer(buffer)) return buffer.toString('base64');
  if (buffer && buffer.type === 'Buffer' && Array.isArray(buffer.data)) return Buffer.from(buffer.data).toString('base64');
  if (buffer && typeof buffer.buffer === 'object') return Buffer.from(buffer.buffer).toString('base64');
  if (buffer && typeof buffer.value === 'function') return Buffer.from(buffer.value()).toString('base64');
  try {
    return Buffer.from(buffer).toString('base64');
  } catch {
    return null;
  }
}

function toDataUrl(buffer, contentType) {
  const b64 = bufferToBase64(buffer);
  if (!b64) return null;
  return `data:${contentType || 'image/jpeg'};base64,${b64}`;
}

function imageToJson(obj) {
  if (!obj) return null;
  if (obj.data != null && obj.contentType) return toDataUrl(obj.data, obj.contentType);
  if (Buffer.isBuffer(obj)) return toDataUrl(obj, 'image/jpeg');
  if (obj && obj.type === 'Buffer' && Array.isArray(obj.data)) return toDataUrl(Buffer.from(obj.data), 'image/jpeg');
  return null;
}

module.exports = { parseImageInput, toDataUrl, imageToJson };
