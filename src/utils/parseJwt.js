export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const buff = Buffer.from(base64, 'base64');
    const payload = buff.toString('utf-8');
    return JSON.parse(payload);
  } catch (e) {
    return {};
  }
}