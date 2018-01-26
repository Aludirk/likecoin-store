/* eslint import/prefer-default-export: "off" */
import * as api from '@/util/api/api';
import * as types from '@/store/mutation-types';
import apiWrapper from './api-wrapper';

export async function newUser({ commit }, data) {
  commit(types.UI_START_BLOCKING_LOADING);
  await apiWrapper(commit, api.apiPostNewUser(data));
  commit(types.UI_STOP_BLOCKING_LOADING);
}

export function setLocalWallet({ commit }, wallet) {
  commit(types.USER_SET_LOCAL_WALLET, wallet);
}

export async function isUser({ commit }, addr) {
  try {
    const { data: user } = await api.apiCheckIsUser(addr);
    if (user && user.user) {
      commit(types.USER_SET_USER_INFO, user);
    }
  } catch (error) {
    // do nothing
  }
}
