export const getUserInfo = state => state.user;

export const getUserIsRegistered = state => !!state.user.wallet;
