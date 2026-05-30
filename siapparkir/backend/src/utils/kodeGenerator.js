const { v4: uuidv4 } = require('uuid');

const generateKodeLaporan = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const suffix  = uuidv4().split('-')[0].toUpperCase().slice(0, 6);
  return `LP-${dateStr}-${suffix}`;
};

const generateKodeUser = (role) => {
  const prefix = role === 'admin' ? 'ADM' : role === 'petugas' ? 'PTG' : 'USR';
  const suffix = uuidv4().split('-')[0].toUpperCase().slice(0, 6);
  return `${prefix}-${suffix}`;
};

module.exports = { generateKodeLaporan, generateKodeUser };