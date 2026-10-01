import { profileStore } from '../storage/profile-store';
import { ExtensionMessage } from '../types/messages';

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[ApplyKit] Extension installed / updated:', details.reason);
  if (details.reason === 'install') {
    const profile = await profileStore.get();
    if (!profile.settings.hasCompletedOnboarding) {
      // Open options onboarding page on first install
      chrome.runtime.openOptionsPage();
    }
  }
});

// Handle keyboard shortcuts defined in manifest commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log('[ApplyKit] Keyboard command received:', command);

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!activeTab || !activeTab.id) return;

  const profile = await profileStore.get();

  let textToCopy = '';
  let label = '';

  switch (command) {
    case 'toggle-floating-panel': {
      const toggleMsg: ExtensionMessage = { type: 'TOGGLE_FLOATING_PANEL' };
      chrome.tabs.sendMessage(activeTab.id, toggleMsg).catch((err) => {
        console.warn('[ApplyKit] Could not send toggle message to content script:', err);
      });
      return;
    }
    case 'copy-linkedin':
      textToCopy = profile.profiles.linkedin || '';
      label = 'LinkedIn URL';
      break;
    case 'copy-github':
      textToCopy = profile.profiles.github || '';
      label = 'GitHub URL';
      break;
    case 'copy-leetcode':
      textToCopy = profile.profiles.leetcode || '';
      label = 'LeetCode URL';
      break;
    case 'copy-portfolio':
      textToCopy = profile.profiles.portfolio || '';
      label = 'Portfolio URL';
      break;
    default:
      console.warn('[ApplyKit] Unrecognized command:', command);
      return;
  }

  if (!textToCopy || textToCopy.trim().length === 0) {
    const msg: ExtensionMessage = {
      type: 'SHOW_TOAST',
      payload: {
        message: `${label} is not set in your ApplyKit profile`,
        toastType: 'info',
      },
    };
    chrome.tabs.sendMessage(activeTab.id, msg).catch(() => {});
    return;
  }

  // Send trigger to content script to write to clipboard and show feedback
  const msg: ExtensionMessage = {
    type: 'TRIGGER_QUICK_COPY',
    payload: {
      key: command,
      label,
      text: textToCopy,
    },
  };

  chrome.tabs.sendMessage(activeTab.id, msg).catch((err) => {
    console.warn('[ApplyKit] Could not send shortcut message to content script:', err);
  });
});
