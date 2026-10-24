(function () {
  const h = CMS.h;

  function fieldConfig(field) {
    const config = field && field.get && field.get('config');
    return config && typeof config.toJS === 'function' ? config.toJS() : config || {};
  }

  function sessionTokenKey(uploadUrl) {
    return `decap-r2-upload-token:${uploadUrl}`;
  }

  CMS.registerWidget(
    'r2-image',
    CMS.createClass({
      getInitialState() {
        const uploadUrl = fieldConfig(this.props.field).upload_url || '';
        let token = '';
        try {
          token = window.sessionStorage.getItem(sessionTokenKey(uploadUrl)) || '';
        } catch {
          // The editor can still enter the token when session storage is unavailable.
        }
        return { token, busy: false, message: '', error: false };
      },

      handleTokenChange(event) {
        this.setState({ token: event.target.value, message: '', error: false });
      },

      async handleFileChange(event) {
        const file = event.target.files && event.target.files[0];
        event.target.value = '';
        if (!file) return;

        const config = fieldConfig(this.props.field);
        const maxFileSize = config.max_file_size || 5 * 1024 * 1024;
        if (file.size > maxFileSize) {
          this.setState({ message: 'A kép nagyobb a megengedett 5 MB-nál.', error: true });
          return;
        }

        if (!this.state.token.trim()) {
          this.setState({ message: 'Add meg a Cloudflare feltöltési jelszót.', error: true });
          return;
        }

        if (!config.upload_url || config.upload_url.includes('YOUR-SUBDOMAIN')) {
          this.setState({ message: 'Előbb állítsd be a Worker URL-jét a CMS konfigurációban.', error: true });
          return;
        }

        this.setState({ busy: true, message: 'Feltöltés folyamatban…', error: false });
        try {
          const response = await fetch(config.upload_url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.state.token.trim()}`,
              'Content-Type': file.type,
            },
            body: file,
          });
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.error || `A feltöltés nem sikerült (${response.status}).`);
          if (!result.url) throw new Error('A Worker nem adott vissza kép URL-t.');

          try {
            window.sessionStorage.setItem(sessionTokenKey(config.upload_url), this.state.token.trim());
          } catch {
            // The upload succeeded; the editor can re-enter the token next time.
          }
          this.props.onChange(result.url);
          this.setState({ busy: false, message: 'A kép feltöltve. Mentsd el az árlistát is.', error: false });
        } catch (error) {
          this.setState({ busy: false, message: error.message || 'A feltöltés nem sikerült.', error: true });
        }
      },

      clearImage() {
        this.props.onChange('');
        this.setState({ message: 'A kép hivatkozását eltávolítottad. A fájl az R2-ben megmarad.', error: false });
      },

      render() {
        const value = this.props.value || '';
        const messageStyle = {
          color: this.state.error ? '#b42318' : '#49785e',
          fontSize: '12px',
          marginTop: '8px',
        };

        return h(
          'div',
          { className: this.props.classNameWrapper },
          h('label', { htmlFor: `${this.props.forID}-token` }, 'Cloudflare feltöltési jelszó'),
          h('input', {
            id: `${this.props.forID}-token`,
            type: 'password',
            value: this.state.token,
            onChange: this.handleTokenChange,
            autoComplete: 'off',
            placeholder: 'A Worker titkos feltöltési jelszava',
            style: { display: 'block', width: '100%', margin: '6px 0 12px' },
          }),
          value && h(
            'div',
            { style: { marginBottom: '12px' } },
            h('img', {
              src: value,
              alt: 'Feltöltött kép előnézete',
              style: { display: 'block', maxWidth: '220px', maxHeight: '160px', objectFit: 'cover', marginBottom: '8px' },
            }),
            h('button', { type: 'button', onClick: this.clearImage, disabled: this.state.busy }, 'Kép hivatkozásának törlése'),
          ),
          h('input', {
            type: 'file',
            accept: 'image/jpeg,image/png,image/gif,image/webp',
            onChange: this.handleFileChange,
            disabled: this.state.busy,
          }),
          this.state.busy && h('span', { role: 'status', style: { marginLeft: '8px' } }, 'Feltöltés…'),
          this.state.message && h('p', { role: this.state.error ? 'alert' : 'status', style: messageStyle }, this.state.message),
        );
      },
    }),
  );
})();
