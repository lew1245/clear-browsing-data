import browser from 'webextension-polyfill';
import {difference} from 'lodash-es';

import storage from 'storage/storage';
import {getText, createTab, getActiveTab} from 'utils/common';
import {projectUrl} from 'utils/data';

async function getEnabledDataTypes(options) {
  if (typeof options === 'undefined') {
    options = await storage.get(['dataTypes', 'disabledDataTypes'], 'sync');
  }
  return difference(options.dataTypes, options.disabledDataTypes);
}

function getListItems(data, {scope = '', shortScope = ''} = {}) {
  const labels = {};
  for (const [group, items] of Object.entries(data)) {
    labels[group] = [];
    items.forEach(function(value) {
      const item = {
        id: value,
        label: getText(`${scope ? scope + '_' : ''}${value}`)
      };
      if (shortScope) {
        item.shortLabel = getText(`${shortScope}_${value}`);
      }
      labels[group].push(item);
    });
  }
  return labels;
}

function showNotification({message, messageId, title, type = 'info'}) {
  if (!title) {
    title = getText('extensionName');
  }
  if (messageId) {
    message = getText(messageId);
  }
  return browser.notifications.create(`cbd-notification-${type}`, {
    type: 'basic',
    title: title,
    message: message,
    iconUrl: '/src/icons/app/icon-48.png'
  });
}

async function showContributePage(action = false) {
  await storage.set({contribPageLastOpen: new Date().getTime()}, 'sync');
  const activeTab = await getActiveTab();
  let url = browser.extension.getURL('/src/contribute/index.html');
  if (action) {
    url = `${url}?action=${action}`;
  }
  await createTab(url, {index: activeTab.index + 1});
}

async function showProjectPage() {
  const activeTab = await getActiveTab();
  await createTab(projectUrl, {index: activeTab.index + 1});
}

export {
  getEnabledDataTypes,
  getListItems,
  showNotification,
  showContributePage,
  showProjectPage
};
