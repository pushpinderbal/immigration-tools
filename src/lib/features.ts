export function aiChatEnabled(): boolean {
  if (typeof localStorage !== 'undefined' && localStorage.getItem('ff:ai-chat') === 'off') {
    return false
  }

  const flag = import.meta.env.VITE_FF_AI_CHAT
  if (flag === '0' || flag === 'false' || flag === 'off') {
    return false
  }

  return true
}
