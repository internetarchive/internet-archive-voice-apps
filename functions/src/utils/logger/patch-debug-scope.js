module.exports = function patchDebugScopeEnvVariable (platform) {
  try {
    require(`../../platform/${platform}/env/patch-debug-scope`)();
  } catch (e) {
  }
};
