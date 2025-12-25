export class AuthService extends EventEmitter {
  /**
   * Log out the current user and clear session
   */
  async logout(): Promise<void> {
    if (!this.currentUser) {
      return;
    }

    try {
      await fetch(`${this.apiBaseUrl}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
   } finally {
      const user = this.currentUser;
      this.currentUser = null;
      this.tokenCache.clear();
      this.clearPersistedSession();
      this.emit('logout', user);
    }
  }
}
